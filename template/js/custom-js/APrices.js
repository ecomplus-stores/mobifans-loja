import {
    i19asOf,
    i19from,
    i19interestFree,
    i19of,
    i19to,
    i19upTo,
    i19youEarn
  } from '@ecomplus/i18n'
  
  import {
    i18n,
    price as getPrice,
    onPromotion as checkOnPromotion,
    formatMoney
  } from '@ecomplus/utils'
  
  import waitStorefrontInfo from '@ecomplus/storefront-components/src/js/helpers/wait-storefront-info'
import utm from '@ecomplus/storefront-template/template/js/lib/persist-utm'
  
  const getPriceWithDiscount = (price, discount) => {
    const { type, value } = discount
    let priceWithDiscount
    if (value) {
      if (type === 'percentage') {
        priceWithDiscount = price * (100 - value) / 100
      } else {
        priceWithDiscount = price - value
      }
      return priceWithDiscount > 0 ? priceWithDiscount : 0
    }
  }
  
  export default {
    name: 'APrices',
  
    props: {
      product: {
        type: Object,
        required: true
      },
      isLiteral: Boolean,
      isBig: Boolean,
      isAmountTotal: Boolean,
      installmentsOption: Object,
      discountOption: Object,
      discountText: {
        type: [String, Boolean],
        default: ''
      },
      canShowPriceOptions: {
        type: Boolean,
        default: true
      },
      showPriceOptions: {
        type: Boolean,
        default: false
      }
    },
  
    data () {
      return {
        installmentsNumber: 0,
        monthlyInterest: 0,
        discount: {
          type: null,
          value: 0
        },
        extraDiscount: {
          type: null,
          value: 0,
          min_amount: 0
        },
        discountLabel: this.discountText,
        pointsProgramName: null,
        pointsMinPrice: 0,
        earnPointsFactor: 0
      }
    },
  
    computed: {
      i19asOf: () => i18n(i19asOf),
      i19from: () => i18n(i19from),
      i19interestFree: () => i18n(i19interestFree),
      i19of: () => i18n(i19of),
      i19to: () => i18n(i19to),
      i19upTo: () => i18n(i19upTo),
      i19youEarn: () => i18n(i19youEarn),
      hasDiscountByUtm () {
        const sessionUtm = window.sessionStorage.getItem('ecomUtm')
        if (window.sessionStorage.getItem('ecomUtm')) {
            const utmCampaign = JSON.parse(sessionUtm)
            if (utmCampaign.campaign && utmCampaign.campaign.includes('modelo_')) {
                const modelArray = utm.campaign.match(/modelo_([^@]+)/)
                const model = modelArray[1].replace('_', ' ')
                const searchedModel = window.modelList.find(option => option.toLowerCase() === model)
                if (this.product && this.product.variations && this.product.variations.length) {
                    return Boolean(this.product.variations.some(variation => variation.name.includes(searchedModel)))
                }
            } else {
                return true
            }
        }
      },
  
      price () {
        const price = getPrice(this.product)
        if (
          this.extraDiscount.value &&
          (!this.extraDiscount.min_amount || price > this.extraDiscount.min_amount)
        ) {
            if (this.hasDiscountByUtm) {
                return getPriceWithDiscount(price, this.extraDiscount)
            }
          
        }
        return price
      },
  
      comparePrice () {
        if (checkOnPromotion(this.product)) {
          return this.product.base_price
        } else if (this.extraDiscount.value && this.hasDiscountByUtm) {
          return getPrice(this.product)
        }
      },
  
      hasVariedPrices () {
        const { variations } = this.product
        if (variations) {
          const productPrice = getPrice(this.product)
          for (let i = 0; i < variations.length; i++) {
            const price = getPrice({
              ...this.product,
              ...variations[i]
            })
            if (price > productPrice) {
              return true
            }
          }
        }
        return false
      },
  
      priceWithDiscount () {
        return this.canShowPriceOptions && getPriceWithDiscount(this.price, this.discount)
      },
  
      installmentValue () {
        if (this.canShowPriceOptions && this.installmentsNumber >= 2) {
          if (!this.monthlyInterest) {
            return this.price / this.installmentsNumber
          } else {
            const interest = this.monthlyInterest / 100
            return this.price * interest /
              (1 - Math.pow(1 + interest, -this.installmentsNumber))
          }
        }
        return 0
      }
    },
  
    methods: {
      formatMoney,
  
      updateInstallments (installments) {
        if (installments) {
          this.monthlyInterest = installments.monthly_interest
          const minInstallment = installments.min_installment || 5
          const installmentsNumber = parseInt(this.price / minInstallment, 10)
          this.installmentsNumber = Math.min(installmentsNumber, installments.max_number)
        }
      },
  
      updateDiscount (discount) {
        if (
          discount &&
          (!discount.min_amount || discount.min_amount <= this.price) &&
          (!this.isAmountTotal || discount.apply_at === 'total')
        ) {
          this.discount = discount
          if (!this.discountText && this.discountText !== false && discount.label) {
            this.discountLabel = `via ${discount.label}`
          }
        }
      }
    },
  
    watch: {
      price: {
        handler (price) {
          this.$emit('fix-price', price)
        },
        immediate: true
      }
    },
  
    created () {
      if (this.canShowPriceOptions) {
        if (this.discountOption) {
          this.updateDiscount(this.discountOption)
        } else {
          waitStorefrontInfo('apply_discount')
            .then(discountCampaign => {
              if (discountCampaign.available_extra_discount) {
                this.extraDiscount = discountCampaign.available_extra_discount
              }
            })
        }
        if (this.installmentsOption) {
          this.updateInstallments(this.installmentsOption)
        } else {
          waitStorefrontInfo('list_payments')
            .then(paymentInfo => {
              this.updateInstallments(paymentInfo.installments_option)
              this.updateDiscount(paymentInfo.discount_option)
              const pointsPrograms = paymentInfo.loyalty_points_programs
              if (this.isLiteral && pointsPrograms) {
                this.$nextTick(() => {
                  for (const programId in pointsPrograms) {
                    const pointsProgram = pointsPrograms[programId]
                    if (pointsProgram && pointsProgram.earn_percentage > 0) {
                      this.pointsMinPrice = pointsProgram.min_subtotal_to_earn
                      this.pointsProgramName = pointsProgram.name
                      this.earnPointsFactor = pointsProgram.earn_percentage / 100
                      break
                    }
                  }
                })
              }
            })
        }
      }
    }
  }
  