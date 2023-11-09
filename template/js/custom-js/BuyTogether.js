// import { i19buyTogetherWith } from '@ecomplus/i18n'
import { 
    formatMoney,
    onPromotion,
    price as getPrice, 
    recommendedIds,
    name as getName,
    img as getImg,
    variationsGrids as getVariationsGrids
  } from '@ecomplus/utils'
  import { modules, graphs } from '@ecomplus/client'
  import ecomCart from '@ecomplus/shopping-cart'
  import EcomSearch from '@ecomplus/search-engine'
  import APrices from '@ecomplus/storefront-components/src/APrices.vue'
  import ProductCard from '@ecomplus/storefront-components/src/ProductCard.vue'
  import APicture from '@ecomplus/storefront-components/src/APicture.vue'
  import ALink from '@ecomplus/storefront-components/src/ALink.vue'
  
  const storefront = (typeof window === 'object' && window.storefront) || {}
  const getContextBody = () => (storefront.context && storefront.context.body) || {}
  const sanitizeProductBody = body => {
    const product = Object.assign({}, body)
    delete product.body_html
    delete product.body_text
    delete product.specifications
    delete product.inventory_records
    delete product.price_change_records
    return product
  }
  
  export default {
    name: 'BuyTogether',
  
    components: {
      APrices,
      APicture,
      ALink,
      ProductCard
    },
  
    props: {
      baseProduct: {
        type: Object,
        default () {
          return getContextBody()
        }
      },
      ecomCart: {
        type: Object,
        default () {
          return ecomCart
        }
      },
      selectedModel: {
        type: Object,
        default () {
          return {}
        }
      },
      productCardProps: {
        type: Object,
        default () {
          return {
            isSmall: true
          }
        }
      },
      fallbackMatchType: {
        type: String,
        default: (typeof window === 'object' && window.ecomRecommendationsType) || 'recommended'
      },
      selectedVariation: {
        type: String,
        default () {
          return ''
        }
      }
    },
  
    data () {
      return {
        ecomSearch: new EcomSearch()
          .mergeFilter({
            range: {
              quantity: {
                gt: 0
              }
            }
          })
          .mergeFilter({
            term: {
              available: true
            }
          }),
        hasLoadedIds: false,
        hasLoadedItems: false,
        productQnts: {},
        recommendedItems: [],
        selectedProducts: [],
        discount: 0,
        discountType: 'fixed',
        discountValue: 0
      }
    },
  
    computed: {
      i19buyTogether: () => 'Compre junto',
      i19buyTogetherWith: () => 'Compre junto com',
  
      variationSelected () {
          return this.selectedModel && Object.keys(this.selectedModel).length && this.selectedModel['modelo']
      },
  
      items () {
        const items = [
          this.baseProduct,
          ...this.recommendedItems
        ]
        const filterItems = items.filter(item => {
          return this.baseProduct._id !== item._id && !item.name.toLowerCase().includes('capa')
        })
        return filterItems || items
      },
  
      buyTogetherItems () {
        if (this.items && this.variationSelected) {
          const items = this.items.filter(item => {
            if (!(item.variations && item.variations.length)) {
              return item
            } else if (item.variations && item.variations.length) {
              const variationSelected = item.variations.find(variation => {
                const { specifications } = variation
                const selectedVar = specifications['modelo'] && specifications['modelo'][0].text
                if (selectedVar === ('iPhone 13' || 'iPhone 13 Pro' || 'iPhone 13/13 Pro')) {
                  return 'iPhone 13/13 Pro' === this.variationSelected
                } else if (selectedVar) {
                  return selectedVar === this.variationSelected
                }
              })
              return variationSelected && variationSelected.quantity > 0
            }
          })
          return items
        }
        return []
      },
  
      productIds () {
        const productsFromCategory = window.idsBuyTogether || []
        const products = [
          ...Object.keys(this.productQnts),
          ...productsFromCategory
        ]
        
        return products
      },
  
      relatedProducts () {
        const relatedProducts = this.baseProduct.related_products && this.baseProduct.related_products[0]
        return relatedProducts && relatedProducts.product_ids.length
          ? relatedProducts.product_ids
          : []
      },
  
      subtotal () {
        const newItems = [
          ...this.items,
          this.baseProduct
        ]
        return newItems.reduce((acc, item) => {
          return acc + (this.productQnts[item._id] || 1) * getPrice(item)
        }, 0)
      },
  
      canAddToCart () {
        return !this.items.find((item) => {
          return (item.variations) || item.customizations || item.kit_composition
        })
      }
    },
  
    methods: {
      formatMoney,
  
      buy () {
        const discountFactor = (this.subtotal - this.discount) / this.subtotal
        this.items.forEach((item) => {
          const cartItem = this.ecomCart.parseProduct({
            ...item,
            base_price: getPrice(item),
            price: getPrice(item) * discountFactor,
            price_effective_date: {}
          })
          cartItem.quantity = (this.productQnts[item._id] || 1)
          cartItem.keep_item_quantity = true
          this.ecomCart.addItem(cartItem)
        })
      },
  
      calcDiscount () {
        if (this.discountType === 'fixed') {
          this.discount = this.discountValue
        } else {
          this.discount = this.subtotal * this.discountValue / 100
        }
      },
  
      setProductQnts (productsIds) {
        if (productsIds.length) {
          const productQnts = {}
          productsIds.slice(0, 3).forEach(id => {
            productQnts[id] = 1
          })
          this.productQnts = productQnts
        }
      },
  
      sendProducts (product, isChecked) {
        const parsedProduct = JSON.parse(product)
        const indexProduct = this.selectedProducts.findIndex(item => item._id === parsedProduct._id)
        if (isChecked && indexProduct === -1) {
          this.selectedProducts.push(parsedProduct)
        } else if (isChecked === false && indexProduct > -1) {
          this.selectedProducts.splice(indexProduct, 1)
        }
      },
  
      fetchItems () {
        if (!this.productIds.length) {
          this.hasLoadedItems = true
          return
        }
        this.ecomSearch.setProductIds(this.productIds)
        delete this.ecomSearch.dsl.aggs
        this.ecomSearch.dsl.query.bool.filter = this.ecomSearch.dsl.query.bool.filter.slice(1, 4)
        this.ecomSearch.fetch().then(() => {
          console.log(this.ecomSearch.getItems())
          this.recommendedItems = this.recommendedItems.concat(this.ecomSearch.getItems())
        }).finally(() => {
          this.hasLoadedItems = true
        })
      },
      getPrice,
      getName,
      getImg: item => getImg(item, null, 'small'),
      onPromotion
    },
  
    watch: {
      subtotal: {
        handler (subtotal, oldSubtotal) {
          if (subtotal !== oldSubtotal) {
            this.calcDiscount()
          }
        },
        immediate: true
      },
  
      selectedProducts: {
        handler (current, old) {
          if (this.variationSelected) {       
            this.selectedProducts.map(item => {
              if (item.variations && item.variations.length) {
                const variationSelected = item.variations.find(variation => {
                  const { specifications } = variation
                  const selectedVar = specifications['modelo'] && specifications['modelo'][0].text
                  if (selectedVar === ('iPhone 13' || 'iPhone 13 Pro' || 'iPhone 13/13 Pro')) {
                    return 'iPhone 13/13 Pro' === this.variationSelected
                  } else if (selectedVar) {
                    return selectedVar === this.variationSelected
                  }
                })
                if (variationSelected && variationSelected.quantity > 0) {
                  item['variationSelectedId'] = variationSelected._id
                  return item
                }
                return item
              }
              return item
            })
          }
          this.$emit('update:selected-products', this.selectedProducts)
        },
        immediate: true
      },
  
      variationSelected: {
        handler (newModel, oldModel) {
          if (newModel !== oldModel) {
            this.hasLoadedItems = false
            if (newModel) {
              this.buyTogetherItems.map(prod => {
                if (prod.variations && prod.variations.length) {
                  const selectVar = prod.variations.find(variation => {
                    const { specifications } = variation
                    const selectedVar = specifications['modelo'] && specifications['modelo'][0].text
                    if (selectedVar === ('iPhone 13' || 'iPhone 13 Pro' || 'iPhone 13/13 Pro')) {
                      return 'iPhone 13/13 Pro' === this.variationSelected
                    } else if (selectedVar) {
                      return selectedVar === this.variationSelected
                    }
                  })
                  if (selectVar) {
                    prod.name = selectVar.name
                    return prod
                  }
                  return prod
                }
                return prod
              })
            }
            this.$nextTick(() => {
              this.hasLoadedItems = true
            })
          }
        },
        immediate: true
      }
    },
  
    created () {
      if (this.baseProduct && this.baseProduct._id) {
        const cartItem = ecomCart.parseProduct(sanitizeProductBody(this.baseProduct))
        const subtotal = getPrice(cartItem) * cartItem.quantity
        modules({
          url: '/apply_discount.json',
          method: 'POST',
          data: {
            amount: {
              subtotal,
              total: subtotal,
              discount: 0
            },
            items: [cartItem]
          }
        }).then(({ data }) => {
          for (let i = 0; i < data.result.length; i++) {
            const { validated, error, response } = data.result[i]
            if (validated && !error && response.buy_together) {
              const buyTogether = response.buy_together.sort((a, b) => {
                if (a.products && a.products.length) {
                  if (!b.products || !b.products.length) {
                    return -1
                  }
                  if (
                    a.products.length <= b.products.length &&
                    a.discount.value >= b.discount.value
                  ) {
                    return -1
                  }
                  return 0
                }
                return 1
              })
              if (buyTogether[0]) {
                const { products, discount } = buyTogether[0]
                this.productQnts = products || []
                this.discountType = discount.type
                this.discountValue = discount.value
                this.$nextTick(() => {
                  this.calcDiscount()
                })
              }
            }
          }
        }).finally(() => {
          this.hasLoadedIds = true
          this.$nextTick(() => {
            if (!this.productIds.length) {
              if (this.relatedProducts.length) {
                this.setProductQnts(this.relatedProducts)
                this.fetchItems()
              } else if (this.fallbackMatchType) {
                graphs({ url: `/products/${this.baseProduct._id}/${this.fallbackMatchType}.json` })
                  .then(({ data }) => {
                    this.setProductQnts(recommendedIds(data))
                    this.$nextTick(() => {
                      this.fetchItems()
                    })
                  })
              }
            } else {
              this.fetchItems()
            }
          })
        })
      }
    }
  }
  