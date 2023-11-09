import {
  i19select,
  i19selectVariation
} from '@ecomplus/i18n'

import {
  i18n,
  inStock as checkStock,
  specValueByText as getSpecValueByText,
  specTextValue as getSpecTextValue,
  variationsGrids as getVariationsGrids,
  gridTitle as getGridTitle
} from '@ecomplus/utils'

export default {
  name: "ProductVariations",

  props: {
    product: {
      type: Object,
      required: true
    },
    selectedId: String,
    maxOptionsBtns: {
      type: Number,
      default: 6
    },
    gridsData: {
      type: Array,
      default() {
        if (
          typeof window === "object" &&
          window.storefront &&
          window.storefront.data
        ) {
          return window.storefront.data.grids;
        }
      }
    }
  },

  data() {
    return {
      selectedOptions: {},
      filteredGrids: {}
    };
  },

  updated() {
    this.changeVariationURL();
  },

  computed: {
    i19select: () => i18n(i19select),
    i19selectVariation: () => i18n(i19selectVariation),

    variationsGrids() {
      const variations = getVariationsGrids(this.product)
      console.log(variations)
      if (variations) {
        const variationModified = {}
        const keys = Object.keys(variations)
        keys.forEach(key => {
          variationModified[key] = []
          variations[key].forEach(variation => {
            const totalVariation = this.product.variations.find(item => item.name.indexOf(variation) > -1)
            if (totalVariation && Array.isArray(totalVariation.flags) && totalVariation.flags.length) {
              variationModified[key].push(
                `${variation} (${totalVariation.flags[0]})`  
              )
            } else {
              variationModified[key].push(variation)
            }
          })
        })
        return variationModified
      }
    },

    variationFromUrl () {
      if (typeof window === 'object') {
        const urlParams = new URLSearchParams(window.location.search)
        console.log(urlParams)
        const variationId = urlParams.get('variation_id')
        if (variationId) {
          return variationId
        }
      }
      return null
    },

    orderedGrids() {
      return Object.keys(this.variationsGrids);
    }
  },

  methods: {
    changeVariationURL(marcaParam) {
      let marcaSelected = this.selectedOptions.marca_do_aparelho;
      let modeloSelected = this.selectedOptions.modelo;
      let corSelected = this.selectedOptions.colors;
      let url = "";


      if (marcaParam === null && modeloSelected !== undefined) {
        modeloSelected = modeloSelected.replaceAll(" ", "-");

        if (corSelected !== undefined) {
          corSelected = corSelected.replaceAll(" ", "-");

          url = `?modelo=${modeloSelected}&cor=${corSelected}`;
        } else {
          url = `?modelo=${modeloSelected}`;
        }

        window.history.pushState("object or string", "", `${url}`);

      } else if (marcaSelected !== undefined && modeloSelected !== undefined) {
        modeloSelected = modeloSelected.replaceAll(" ", "-");

        if (corSelected !== undefined) {
          corSelected = corSelected.replaceAll(" ", "-");

          url = `?marca=${marcaSelected}&modelo=${modeloSelected}&cor=${corSelected}`;
        } else {
          url = `?marca=${marcaSelected}&modelo=${modeloSelected}`;
        }
        console.log(window.history)

        window.history.pushState("object or string", "", `${url}`);
      }
    },

    setVariationFromURL() {
      let paramsURL = window.location.search;
      if (paramsURL) {
        let getParam = new URLSearchParams(paramsURL);
        let gridType = "marca_do_aparelho";
        let index = 0;
        let marcaParam = getParam.get("marca");
        console.log(marcaParam)
  
        if (marcaParam !== null) {
          index = this.orderedGrids.findIndex(option => option === gridType)
          this.$nextTick(() => {
            this.selectOption(marcaParam, gridType, index);
          })
        }
  
        let modeloParam = getParam.get("modelo");
        console.log(modeloParam)
        let gridTypeModelo = "modelo";
        let indexModelo = 1;
  
        modeloParam = modeloParam.replaceAll("-", " ");
        if (modeloParam) {
          indexModelo = this.orderedGrids.findIndex(option => option === gridTypeModelo)
          this.$nextTick(() =>
          this.selectOption(modeloParam, gridTypeModelo, indexModelo)
        );
        }
        
  
        let corParam = getParam.get("cor");
        let gridTypeCor = "colors";
        let indexCor = 2;
  
        
        if (corParam) {
          corParam = corParam.replaceAll("-", " ");
          indexCor = this.orderedGrids.findIndex(option => option === gridTypeCor)
          this.$nextTick(() => this.selectOption(corParam, gridTypeCor, indexCor));
        }
  
        
        console.log('---------------')
        console.log(marcaParam)
        if (marcaParam) {
          this.changeVariationURL(marcaParam); 
        }
      }
    },

    getColorOptionBg(optionText) {
      const rgbs = optionText.split(",").map(colorName => {
        return getSpecValueByText(
          this.product.variations,
          colorName.trim(),
          "colors"
        );
      });
      return rgbs.length > 1
        ? `background:linear-gradient(to right bottom, ${rgbs[0]} 50%, ${rgbs[1]} 50%)`
        : `background:${rgbs[0]}`;
    },

    getSpecValue(optionText, grid) {
      const { variations } = this.product;
      let values;
      if (grid === "colors") {
        const colorNames = optionText.split(",");
        if (colorNames.length > 1) {
          values = [];
          colorNames.forEach(color => {
            values.push(getSpecValueByText(variations, color.trim(), grid));
          });
        }
      }
      return values || getSpecValueByText(variations, optionText, grid);
    },

    getGridTitle(grid) {
      return getGridTitle(grid, this.gridsData);
    },

    selectOption(optionText, grid, gridIndex) {
      console.log(optionText, grid, gridIndex)
      const { product, selectedOptions, orderedGrids } = this;
      let variationText
      if (optionText.includes('novo')) {
        variationText = optionText.replace('(novo)', '').trim()
      }
      
      this.$set(selectedOptions, grid, optionText);
      this.$emit("select-option", {
        gridId: grid,
        gridIndex,
        optionText
      });
      window.selectedOption = selectedOptions
      this.$emit('update:selected-model', selectedOptions)
      const filterGrids = {};
      for (let i = 0; i <= gridIndex; i++) {
        const grid = orderedGrids[i];
        if (selectedOptions[grid]) {
          filterGrids[grid] = selectedOptions[grid];
        }
      }
      const nextFilteredGrids = getVariationsGrids(product, filterGrids, true);
      for (let i = gridIndex + 1; i < orderedGrids.length; i++) {
        const grid = orderedGrids[i];
        const options = nextFilteredGrids[grid];
        this.filteredGrids[grid] = options;
        if (selectedOptions[grid] && !options.includes(selectedOptions[grid])) {
          this.$set(selectedOptions, grid, undefined);
        }
      }
      const variations = product.variations.slice(0);
      for (let i = 0; i < variations.length; i++) {
        const variation = variations[i];
        const { specifications } = variation;
        for (const grid in specifications) {
          if (selectedOptions[grid] !== getSpecTextValue(variation, grid)) {
            variations.splice(i, 1);
            i--;
            break;
          }
        }
      }
      this.$emit(
        "update:selected-id",
        variations.length ? variations[0]._id : null
      );
    }
  },

  watch: {
    "product.variations": {
      handler() {
        this.filteredGrids = getVariationsGrids(this.product, null, true);
      },
      deep: true,
      immediate: true
    }
  },

  mounted () {
    if (this.variationFromUrl && Array.isArray(this.product.variations)) {
      const selectedVariation = this.product.variations.find(variation => variation._id === this.variationFromUrl)
      if (selectedVariation) {
        const { specifications } = selectedVariation
        const specs = Object.keys(specifications)
        const nextSpec = (specIndex = 0) => {
          const spec = specs[specIndex]
          if (specs[specIndex] && specifications[spec] && specifications[spec].length === 1) {
            const specText = specifications[spec][0].text
            if (this.variationsGrids[spec].find(option => option === specText)) {
              this.$nextTick(() => {
                this.selectOption(specText, spec, this.orderedGrids.indexOf(spec))
                nextSpec(specIndex + 1)
              })
            }
          }
        }
        nextSpec()
      }
    } else {
      setTimeout(() => {
        this.$nextTick(() => {
          this.setVariationFromURL();
        })  
      }, 2000);
    }
  }
};
