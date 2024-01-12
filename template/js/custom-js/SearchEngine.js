import {
    i19all,
    i19asOf,
    i19brands,
    i19categories,
    i19clearFilters,
    i19closeFilters,
    i19didYouMean,
    i19filter,
    i19filterResults,
    i19highestPrice,
    i19itemsFound,
    i19lowestPrice,
    i19name,
    i19noResultsFor,
    i19popularProducts,
    i19price,
    i19refineSearch,
    i19releases,
    i19relevance,
    i19results,
    i19sales,
    i19searchAgain,
    i19searchingFor,
    i19searchOfflineErrorMsg,
    i19sort,
    i19upTo
  } from '@ecomplus/i18n'
  
  import {
    i18n,
    formatMoney
  } from '@ecomplus/utils'
  
  import lozad from 'lozad'
  import EcomSearch from '@ecomplus/search-engine'
  import { Portal } from '@linusborg/vue-simple-portal'
  import scrollToElement from '@ecomplus/storefront-components/src/js/helpers/scroll-to-element'
  import ABackdrop from '@ecomplus/storefront-components/src/ABackdrop.vue'
  import ProductCard from '@ecomplus/storefront-components/src/ProductCard.vue'
  
  const resetEcomSearch = ({ ecomSearch, term, page, defaultSort }) => {
    ecomSearch.reset()
    if (defaultSort) {
      ecomSearch.setSortOrder(defaultSort)
    }
    if (term) {
      ecomSearch.setSearchTerm(term)
    }
    if (page) {
      ecomSearch.setPageNumber(page)
    }
  }
  
  export default {
    name: 'SearchEngine',
  
    components: {
      Portal,
      ABackdrop,
      ProductCard
    },
  
    props: {
      term: String,
      page: {
        type: Number,
        default: 1
      },
      pageSize: {
        type: Number,
        default: 24
      },
      brands: Array,
      categories: Array,
      isFixedBrands: Boolean,
      isFixedCategories: Boolean,
      defaultSort: String,
      defaultFilters: Object,
      autoFixScore: {
        type: Number,
        default: 0.6
      },
      isFilterable: {
        type: Boolean,
        default: true
      },
      hasPopularItems: {
        type: Boolean,
        default: true
      },
      canLoadMore: {
        type: Boolean,
        default: true
      },
      loadMoreSelector: String,
      canRetry: {
        type: Boolean,
        default: true
      },
      canShowItems: {
        type: Boolean,
        default: true
      },
      productCardProps: Object,
      gridsData: {
        type: Array,
        default () {
          if (typeof window === 'object' && window.storefront && window.storefront.data) {
            return window.storefront.data.grids
          }
        }
      }
    },
  
    data () {
      return {
        suggestedTerm: '',
        resultItems: [],
        totalSearchResults: 0,
        hasSearched: false,
        noResultsTerm: '',
        keepNoResultsTerm: false,
        filters: [],
        priceRange: {},
        priceOptions: [],
        hasSetPriceRange: false,
        lastSelectedFilter: null,
        selectedOptions: {},
        selectedSortOption: null,
        countOpenRequests: 0,
        lastRequestId: null,
        isScheduled: false,
        isLoadingMore: false,
        mustSkipLoadMore: false,
        hasNetworkError: false,
        popularItems: [],
        hasSetPopularItems: false,
        isAsideVisible: false,
        searchFilterId: 0
      }
    },
  
    computed: {
      i19all: () => i18n(i19all),
      i19clearFilters: () => i18n(i19clearFilters),
      i19closeFilters: () => i18n(i19closeFilters),
      i19didYouMean: () => i18n(i19didYouMean),
      i19filter: () => i18n(i19filter),
      i19filterResults: () => i18n(i19filterResults),
      i19itemsFound: () => i18n(i19itemsFound),
      i19noResultsFor: () => i18n(i19noResultsFor),
      i19popularProducts: () => i18n(i19popularProducts),
      i19price: () => i18n(i19price),
      i19refineSearch: () => i18n(i19refineSearch),
      i19relevance: () => i18n(i19relevance),
      i19results: () => i18n(i19results),
      i19searchAgain: () => i18n(i19searchAgain),
      i19searchingFor: () => i18n(i19searchingFor),
      i19searchOfflineErrorMsg: () => i18n(i19searchOfflineErrorMsg),
      i19sort: () => i18n(i19sort),
  
      ecomSearch: () => new EcomSearch(),
  
      modelSpec () {
        return this.isSearchingPhoneModel && this.isSearchingPhoneModel.modelo || this.categories && this.categories.length && this.categories[0].replace('Capas para ', '').replace('New! ', '').replace(' (todos modelos)', '')
      },
  
      isSearchingPhoneModel (){
        let body = this.resultItems[0];
        let nameProduct = body.name;
        let getListModels = body.variations;
        let term = this.term;
        let listNomeProduto = {nome: "", modelo: "", marca: "", cor: "", foto: [], specifictions: ""};
  
        //setando foto defaut e hover 
        body.pictures.map(function(product, index) {
          if (index === 0) {
            let foto = (product.normal || product.zoom).url;
            listNomeProduto.foto.push(foto);
          }
          if (index === 1) {
            let foto = (product.normal || product.zoom).url;
            listNomeProduto.foto.push(foto);
          }
        });
  
        //setando term em paginas de categoria
        if (term === undefined || term === null) {
          if ($(".page-title__head h1").length > 0) { 
            term = $(".page-title__head h1").text();
          }
        }     
  
        if(term !== undefined && term !== null){
          term = term.toLowerCase();
          nameProduct = nameProduct.toLowerCase();
          if(getListModels !== undefined){
  
            getListModels.map((variation) => {    
            
              if(variation !== undefined){
                let modeloVariation = "";
                let marcaVariation = "";
                let variationColor = "";
                let modeloVariationInitial = "";
                let pictureId = variation.picture_id;
  
                
                //se array nao for vazio 
                if (variation && variation.specifications && variation.specifications.modelo && variation.specifications.modelo.length > 0){
                  modeloVariation = variation.specifications.modelo[0].text;
                  modeloVariationInitial = variation.specifications.modelo[0].text;
                  modeloVariation = modeloVariation.toLowerCase();
                }
  
                //console.log(modeloVariationInitial)
                //console.log(variation.name)
                //console.log(variation)
                //console.log(body.pictures)
  
  
                if (variation.specifications.marca_do_aparelho !== "" && variation.specifications.marca_do_aparelho !== undefined && variation.specifications.marca_do_aparelho !== null) {
                  
                  if(variation.specifications.marca_do_aparelho.length > 0){
                    marcaVariation = variation.specifications.marca_do_aparelho[0].text;
                    modeloVariation = modeloVariation.toLowerCase();
                  }
                }
  
                if(variation.specifications.colors !== undefined){
                  
                  if(variation.specifications.colors.length > 0){
                    variationColor = variation.specifications.colors[0].text;
                    variationColor = variationColor.toLowerCase(); 
                  }
                }
  
                //se tem o nome do produto 
                if(term.indexOf(nameProduct) !== -1 ){
                  nameProduct = nameProduct.charAt(0).toUpperCase() + nameProduct.slice(1)
                  listNomeProduto.nome = nameProduct;
                }
  
                //console.log("nameProduct", nameProduct);
                //console.log("marcaVariation", marcaVariation);
                //console.log("modeloVariation", modeloVariation);
  
                //se tem o modelo ja seta a marca 
                if (term.indexOf(modeloVariation) !== -1 && marcaVariation !== "") {
                  modeloVariation =
                    modeloVariation.charAt(0).toUpperCase() +
                    modeloVariation.slice(1);
  
                  if (modeloVariation.indexOf("Iphone") !== -1) {
                    modeloVariation = modeloVariation.replaceAll(
                      "Iphone",
                      "iPhone"
                    );
                  }
  
                  listNomeProduto.modelo = modeloVariationInitial;
                  listNomeProduto.marca = marcaVariation;
  
                  switch (marcaVariation) {
                    case "Samsung":
                      body.pictures.map(function(product, index) {
                        if (product._id == pictureId) {
                          let foto = (product.normal || product.zoom).url;
                          listNomeProduto.foto = [];
                          listNomeProduto.foto.unshift(foto);
                        }
                      });
                      break;
                    case "Apple":
                      body.pictures.map(function(product, index) {
                        if (product._id == pictureId) {
                          let foto = (product.normal || product.zoom).url;
                          listNomeProduto.foto = [];
                          listNomeProduto.foto.unshift(foto);
                        }
                      });
                      break;
                    case "Motorola":
                      body.pictures.map(function(product, index) {
                        if (product._id == pictureId) {
                          let foto = (product.normal || product.zoom).url;
                          listNomeProduto.foto = [];
                          listNomeProduto.foto.unshift(foto);
                        }
                      });
                      break;
                    case "LG":
                      body.pictures.map(function(product, index) {
                        if (product._id == pictureId) {
                          let foto = (product.normal || product.zoom).url;
                          listNomeProduto.foto = [];
                          listNomeProduto.foto.unshift(foto);
                        }
                      });
                      break;
                    case "Huawei":
                      body.pictures.map(function(product, index) {
                        if (product._id == pictureId) {
                          let foto = (product.normal || product.zoom).url;
                          listNomeProduto.foto = [];
                          listNomeProduto.foto.unshift(foto);
                        }
                      });
                      break;
                    case "Xiaomi":
                      body.pictures.map(function(product, index) {
                        if (product._id == pictureId) {
                          let foto = (product.normal || product.zoom).url;
                          listNomeProduto.foto = [];
                          listNomeProduto.foto.unshift(foto);
                        }
                      });
                      break;
                  }
                }
  
                //se nao tem a variacao de marca
                if (term.indexOf(modeloVariation) !== -1) {
                  listNomeProduto.modelo = modeloVariationInitial;
  
                  body.pictures.map(function(product, index) {
                    if (product._id == pictureId) {
                      let foto = (product.normal || product.zoom).url;
                      listNomeProduto.foto = [];
                      listNomeProduto.foto.push(foto);
                    }
                  });
                }              
              }
            })
            
          }
        }   
        
        //console.log("nameProduct", nameProduct);
        //console.log("marcaVariation", marcaVariation);
        //console.log("modeloVariation", modeloVariation);
        //console.log("nameProduct", nameProduct);
        //console.log("listNomeProduto", listNomeProduto);
  
        if(listNomeProduto.cor !== "" && listNomeProduto.modelo !== ""){
          //listNomeProduto.specifictions = `${listNomeProduto.marca} / ${listNomeProduto.modelo} / ${listNomeProduto.cor}`;
  
          this.marcaSearch = `?marca=${listNomeProduto.marca}`;
  
          let listNomeProdutoModelo = listNomeProduto.modelo.replaceAll(' ','-');
          this.modeloSearch = `&modelo=${listNomeProdutoModelo}`;
          this.corSearch = `&cor=${listNomeProduto.cor}`;
  
        }
        else if(listNomeProduto.cor !== ""){
          listNomeProduto.specifictions = `${listNomeProduto.cor}`;
          this.corSearch = `&cor=${listNomeProduto.cor}`;
  
        }else if(listNomeProduto.modelo !== "" && listNomeProduto.marca !== ""){
          //listNomeProduto.specifictions = `${listNomeProduto.marca} / ${listNomeProduto.modelo}`;
          this.marcaSearch = `?marca=${listNomeProduto.marca}`;
  
          let listNomeProdutoModelo = listNomeProduto.modelo.replaceAll(' ','-');
  
          this.modeloSearch = `&modelo=${listNomeProdutoModelo}`;
  
        }else if(listNomeProduto.marca !== ""){
          listNomeProduto.specifictions = listNomeProduto.marca; 
          this.marcaSearch = `?marca=${listNomeProduto.marca}`;
        }else if(listNomeProduto.modelo !== "" && listNomeProduto.marca === ""){
          listNomeProduto.specifictions = listNomeProduto.modelo;
  
          let listNomeProdutoModelo = listNomeProduto.modelo.replaceAll(' ','-');
          this.modeloSearch = `?modelo=${listNomeProdutoModelo}`;
        }
  
        return listNomeProduto;
  
      },
  
      isSearching () {
        return this.countOpenRequests > 0
      },
  
      hasCapa () {
        return this.term && this.term.toLowerCase().indexOf('cap') > -1
      },
  
      hasPelicula () {
        return this.term && this.term.toLowerCase().indexOf('pel') > -1
      },
  
      filteredItems () {
        let resultItems = this.resultItems
        const orderItems = window.categoryOrder || []
        if (this.hasCapa) {
          resultItems = resultItems.filter(item => item.name.toLowerCase().includes('cap'))
        } else if (this.hasPelicula) {
          resultItems = resultItems.filter(item => item.name.toLowerCase().includes('pel'))
        }
        const filtered = resultItems.filter(item => {
          if (item.variations && item.variations.length) {
            return item.variations.find(variation => variation.specifications['modelo'] && variation.specifications['modelo'][0] && variation.specifications['modelo'][0].text === this.modelSpec && variation.quantity > 0)
          }
          return item.quantity > 0
        })
        const diff = resultItems.filter(({ _id: id1 }) => !filtered.some(({ _id: id2 }) => id2 === id1))
        let allProducts = [
          ...filtered,
          ...diff
        ]
  
        if (orderItems && orderItems.length) {
          allProducts.sort((a, b) => {
            const modelNameA = orderItems.find(id => b.sku === id) || '';
            const modelNameB = orderItems.find(id => a.sku === id) || '';
  
            const indexA = orderItems.findIndex(id => id === modelNameA);
            const indexB = orderItems.findIndex(id => id === modelNameB);
  
            if (modelNameA === '' && modelNameB === '') {
              return 1; 
            } else if (modelNameA === '' && modelNameB !== '') {
              return -1
            } else if (modelNameA !== '' && modelNameB === '') {
              return 1
            }
  
            return indexB - indexA;
          });
        }
        
        return allProducts
        /* const items = [ ...this.resultItems ]
        const lengthItems = this.resultItems.length
        this.resultItems.forEach((item, i) => {
          if (item.variations && item.variations.length) {
            const hasProduct = item.variations.find(variation => variation.specifications['modelo'][0].text === this.modelSpec && !variation.quantity)
            if (hasProduct) {
              console.log(i)
              const removedItem = items.splice(i, 1)[0]
              items.splice(lengthItems, 0, removedItem)
            }
          }
        })
        return items */
      },
  
      hasEmptyResult () {
        return this.hasSearched && !this.resultItems.length
      },
  
      sortOptions: () => [
        {
          value: null,
          label: i18n(i19relevance)
        }, {
          value: 'sales',
          label: i18n(i19sales)
        }, {
          value: 'lowest_price',
          label: i18n(i19lowestPrice)
        }, {
          value: 'highest_price',
          label: i18n(i19highestPrice)
        }, {
          value: 'news',
          label: i18n(i19releases)
        }, {
          value: 'slug',
          label: i18n(i19name)
        }
      ],
  
      hasSelectedOptions () {
        for (const filter in this.selectedOptions) {
          if (this.selectedOptions[filter] && this.selectedOptions[filter].length) {
            return true
          }
        }
        return false
      },
  
      isNavVisible () {
        return this.hasSearched && this.isFilterable &&
          (this.isSearching ||
            this.totalSearchResults > 8 ||
            this.hasSelectedOptions ||
            this.hasSetPriceRange)
      },
  
      isResultsVisible () {
        return (this.hasSearched && !this.isSearching) || this.suggestedItems.length
      },
  
      hasFilters () {
        return this.hasSelectedOptions ||
          this.filters.find(({ options }) => options.length) ||
          this.hasSetPriceRange
      },
  
      suggestedItems () {
        return this.resultItems.length ? this.resultItems : this.popularItems
      },
  
      loadObserver () {
        return this.canLoadMore && lozad('#search-engine-load-more', {
          load: () => {
            if (!this.mustSkipLoadMore) {
              this.mustSkipLoadMore = this.isLoadingMore = true
              this.fetchItems()
            }
          }
        })
      },
  
      pageAnchorIndex () {
        const count = this.suggestedItems.length
        const rest = count % this.pageSize
        return (rest === 0 ? count - this.pageSize : count - rest) - 1
      }
    },
  
    methods: {
      fetchItems (isRetry, isPopularItems) {
        const ecomSearch = isPopularItems ? new EcomSearch() : this.ecomSearch
        const requestId = Date.now()
        this.countOpenRequests++
        this.lastRequestId = requestId
        if (this.isLoadingMore) {
          ecomSearch.setPageNumber(this.page + Math.ceil(this.resultItems.length / this.pageSize))
        }
        const fetching = ecomSearch.setPageSize(this.pageSize).fetch()
          .then(result => {
            if (this.lastRequestId === requestId) {
              this.hasNetworkError = false
              if (!isPopularItems) {
                this.handleSearchResult()
              }
            }
            if (isPopularItems || (!this.term && !this.brands && !this.categories)) {
              this.hasSetPopularItems = true
              this.popularItems = ecomSearch.getItems()
            }
            return result
          })
          .catch(err => {
            console.error(err)
            if (this.lastRequestId === requestId || isPopularItems) {
              if (this.canRetry && !isRetry && (!err.response || err.response.status !== 400)) {
                this.fetchItems(true, isPopularItems)
              } else {
                this.hasNetworkError = true
              }
            }
          })
          .finally(() => {
            this.countOpenRequests--
            if (this.isLoadingMore) {
              this.isLoadingMore = false
              this.$nextTick(() => setTimeout(() => {
                this.mustSkipLoadMore = false
                this.loadObserver.observe()
              }, 300))
            }
          })
        this.$emit('fetch', { ecomSearch, fetching, isPopularItems })
      },
  
      updateFilters () {
        const updatedFilters = []
        const addFilter = (filter, options, isSpec) => {
          let filterIndex = this.filters.findIndex(filterObj => filterObj.filter === filter)
          if (filter !== this.lastSelectedFilter) {
            if (filterIndex === -1) {
              filterIndex = this.filters.length
            }
            if (this[`isFixed${filter}`]) {
              const presetedOptions = this[filter.toLowerCase()]
              if (presetedOptions) {
                options = options.filter(({ key }) => presetedOptions.indexOf(key) === -1)
              }
            }
            if (filter === 'modelo') {
              const sizeSpec = window.listModel || []
              console.log(sizeSpec)
              console.log(sizeSpec.length)
            
              if (sizeSpec.length) {
                options.sort((a, b) => {
                  const modelNameA = sizeSpec.find(item => b.key === item.filter_option);
                  const modelNameB = sizeSpec.find(item => a.key === item.filter_option);
  
                  const filteredModelA = modelNameA && modelNameA.filter_option || ''
                  const filteredModelB = modelNameB && modelNameB.filter_option || ''
    
                  const indexA = sizeSpec.findIndex(item => item.filter_option && item.filter_option === filteredModelA);
                  const indexB = sizeSpec.findIndex(item => item.filter_option && item.filter_option === filteredModelB);
    
                  if (filteredModelA === '' && filteredModelB === '') {
                    return 1; 
                  } else if (filteredModelA === '' && filteredModelB !== '') {
                    return -1
                  } else if (filteredModelA !== '' && filteredModelB === '') {
                    return 1
                  }
    
                  return indexB - indexA;
                });
              }
            }
            if (filter === 'colors') {
              const arrayOptions = [
                {
                  "_id": "747440159604217630200000",
                  "text": "Black",
                  "option_id": "black",
                  "colors": [
                    "#000000"
                  ]
                },
                {
                  "_id": "747440159604217630200002",
                  "text": "Azul Escuro",
                  "option_id": "azul escuto",
                  "colors": [
                    "rgb(22, 22, 112)"
                  ]
                },
                {
                  "_id": "747440159604217630200003",
                  "text": "Fumê",
                  "option_id": "fume",
                  "colors": [
                    "rgb(153, 150, 150)"
                  ]
                },
                {
                  "_id": "747440159604217630200004",
                  "text": "Marrom",
                  "option_id": "marrom",
                  "colors": [
                    "rgb(144, 111, 95);"
                  ]
                },
                {
                  "_id": "747440159604217630200005",
                  "text": "Gradiente (Rosa)",
                  "option_id": "gradiente rosa",
                  "colors": [
                    "rgb(215, 195, 211)"
                  ]
                },
                {
                  "_id": "747440159604217630200006",
                  "text": "Azul sierra",
                  "option_id": "azul sierra",
                  "colors": [
                    "rgb(171, 192, 206)"
                  ]
                },
                {
                  "_id": "747440159604217630200007",
                  "text": "Vermelho",
                  "option_id": "Vermelho",
                  "colors": [
                    "rgb(255, 0, 0)"
                  ]
                },
                {
                  "_id": "747440159604217630200008",
                  "text": "Lilás",
                  "option_id": "Lilás",
                  "colors": [
                    "rgb(171, 173, 211)"
                  ]
                },
                {
                  "_id": "747440159604217630200009",
                  "text": "Azul",
                  "option_id": "Azul",
                  "colors": [
                    "rgb(46, 147, 230)"
                  ]
                },
                {
                  "_id": "747440159604217630200010",
                  "text": "Gradiente (Pink)",
                  "option_id": "Gradiente (Pink)",
                  "colors": [
                    "rgb(227, 132, 224)"
                  ]
                },
                {
                  "_id": "747440159604217630200011",
                  "text": "Branco",
                  "option_id": "Branco",
                  "colors": [
                    "#fff"
                  ]
                },
                {
                  "_id": "747440159604217630200012",
                  "text": "Preto",
                  "option_id": "Preto",
                  "colors": [
                    "#000"
                  ]
                }, 
                {
                  "_id": "747440159604217630200013",
                  "text": "Gradiente",
                  "option_id": "Gradiente",
                  "colors": [
                    "rgb(199, 59, 131)"
                  ]
                },
                {
                  "_id": "747440159604217630200014",
                  "text": "Verde",
                  "option_id": "Verde",
                  "colors": [
                    "rgb(105, 154, 151)"
                  ]
                },
                {
                  "_id": "747440159604217630200015",
                  "text": "Orange",
                  "option_id": "Orange",
                  "colors": [
                    "rgb(255, 89, 0)"
                  ]
                },
                {
                  "_id": "747440159604217630200016",
                  "text": "Yellow",
                  "option_id": "Yellow",
                  "colors": [
                    "rgb(204, 219, 35)"
                  ]
                },
                {
                  "_id": "747440159604217630200001",
                  "text": "Blue",
                  "option_id": "blue",
                  "colors": [
                    "#3096f0"
                  ]
                },
                {
                  "_id": "747440159604217630200002",
                  "text": "Clear",
                  "option_id": "clear",
                  "colors": [
                    "#f8f8ff"
                  ]
                },
                {
                  "_id": "747440159604217630200003",
                  "text": "Dark Blue",
                  "option_id": "dark_blue",
                  "colors": [
                    "#191970"
                  ]
                },
                {
                  "_id": "747440159604217630200004",
                  "text": "Gold",
                  "option_id": "gold",
                  "colors": [
                    "#d6b704"
                  ]
                },
                {
                  "_id": "747440159604217630200005",
                  "text": "Grey",
                  "option_id": "grey",
                  "colors": [
                    "#a9a9a9"
                  ]
                },
                {
                  "_id": "747440159604217630200006",
                  "text": "Pink",
                  "option_id": "pink",
                  "colors": [
                    "#a38386"
                  ]
                },
                {
                  "_id": "747440159604217630200007",
                  "text": "Red",
                  "option_id": "red",
                  "colors": [
                    "#ff0000"
                  ]
                },
                {
                  "_id": "747440159604217630200008",
                  "text": "Rose Gold",
                  "option_id": "rose_gold",
                  "colors": [
                    "#b76e79"
                  ]
                },
                {
                  "_id": "747440159604217630200009",
                  "text": "White",
                  "option_id": "white",
                  "colors": [
                    "#ffffff"
                  ]
                },
                {
                  "_id": "747440159604217630200010",
                  "text": "Green",
                  "option_id": "green",
                  "colors": [
                    "#a0c633"
                  ]
                },
                {
                  "_id": "747440159604217630200011",
                  "text": "Petroleum",
                  "option_id": "petroleum",
                  "colors": [
                    "#005f6a"
                  ]
                },
                {
                  "_id": "747440159604217630200012",
                  "text": "Purple",
                  "option_id": "purple",
                  "colors": [
                    "#859cc6"
                  ]
                },
                {
                  "_id": "747440159604217630200013",
                  "text": "Dark Magenta",
                  "option_id": "dark_magenta",
                  "colors": [
                    "#8b008b"
                  ]
                },
                {
                  "_id": "747440159604217630200013",
                  "text": "Violeta",
                  "option_id": "violeta",
                  "colors": [
                    "rgb(182, 182, 210)"
                  ]
                },
                {
                  "_id": "811550159604246698600029",
                  "text": "Black com furo",
                  "option_id": "black_com_furo",
                  "colors": [
                    "#050505",
                    "#f8f8ff"
                  ]
                },
                {
                  "_id": "811550159604246698600030",
                  "text": "Dark Blue com furo",
                  "option_id": "dark_blue_com_furo",
                  "colors": [
                    "#141470",
                    "#f8f8ff"
                  ]
                },
                {
                  "_id": "811550159604246698600031",
                  "text": "Grey com furo",
                  "option_id": "grey_com_furo",
                  "colors": [
                    "#787878",
                    "#f8f8ff"
                  ]
                },
                {
                  "_id": "811550159604246698600032",
                  "text": "Pink com furo",
                  "option_id": "pink_com_furo",
                  "colors": [
                    "#ffbac7",
                    "#f8f8ff"
                  ]
                },
                {
                  "_id": "811550159604246698600033",
                  "text": "Red com furo",
                  "option_id": "red_com_furo",
                  "colors": [
                    "#ff1919",
                    "#f8f8ff"
                  ]
                },
                {
                  "_id": "811550159604246698600034",
                  "text": "Transparente+Borda Black",
                  "option_id": "transparenteborda_black",
                  "colors": [
                    "#f8f8ff",
                    "#000000"
                  ]
                },
                {
                  "_id": "525690159604276992100036",
                  "text": "White com furo",
                  "option_id": "white_com_furo",
                  "colors": [
                    "#f7f7f7",
                    "#f5f2f2"
                  ]
                },
                {
                  "_id": "148250161763418969900021",
                  "text": "Turquesa",
                  "option_id": "turquesa",
                  "colors": [
                    "#37a3c4"
                  ]
                },
                {
                  "_id": "651140161764498255800022",
                  "text": "Blue com furo",
                  "option_id": "blue_com_furo",
                  "colors": [
                    "#44b7f5",
                    "#f0f0f0"
                  ]
                },
                {
                  "_id": "436070168805053722300023",
                  "colors": [
                    "#242834"
                  ],
                  "text": "Preto ",
                  "option_id": "preto_"
                },
                {
                  "_id": "436070168805053722300024",
                  "text": "Azul ",
                  "option_id": "azul_",
                  "colors": [
                    "#132d52"
                  ]
                },
                {
                  "_id": "436070168805053722300025",
                  "text": "Verde ",
                  "option_id": "verde_",
                  "colors": [
                    "#173535"
                  ]
                },
                {
                  "_id": "436070168805053722300026",
                  "colors": [
                    "#adcde5"
                  ],
                  "text": "Azul Claro",
                  "option_id": "azul_claro"
                },
                {
                  "_id": "436070168805053722300027",
                  "colors": [
                    "#c7b3bc"
                  ],
                  "text": "Rosa",
                  "option_id": "rosa"
                },
                {
                  "_id": "976300169029858717900028",
                  "text": "Rosa e Verde",
                  "option_id": "rosa_e_verde",
                  "colors": [
                    "#a14b63",
                    "#349e9f"
                  ]
                },
                {
                  "_id": "608640169290509892100029",
                  "text": "Candy",
                  "option_id": "candy",
                  "colors": [
                    "#e7bba4",
                    "#82abbd"
                  ]
                },
                {
                  "_id": "400430169290622287600030",
                  "text": "Rainbown",
                  "option_id": "rainbown",
                  "colors": [
                    "#db9ed4",
                    "#f5ec85"
                  ]
                },
                {
                  "_id": "890060169296981707400031",
                  "text": "Brown",
                  "option_id": "brown",
                  "colors": [
                    "#bf9664"
                  ]
                },
                {
                  "_id": "687600169324283546300032",
                  "text": "Gradiente (Rosa + Verde)",
                  "option_id": "gradiente_rosa__verde",
                  "colors": [
                    "#d24277",
                    "#40c791"
                  ]
                },
                {
                  "_id": "546610169342067812300033",
                  "text": "Gradiente (Blue)",
                  "option_id": "gradiente_blue",
                  "colors": [
                    "#7b8de8"
                  ]
                },
                {
                  "_id": "546610169342067812300034",
                  "text": "Gradiente (Rosa)",
                  "option_id": "gradiente_rosa",
                  "colors": [
                    "#e384e0"
                  ]
                }
              ]
              options = options.map(option => {
                const optionFound = arrayOptions.find(opt => {
                  return opt.text === option.key
                })
                return {
                  ...option,
                  hexadecimal: optionFound && optionFound.colors
                }
              })
            }
            this.filters[filterIndex] = {
              filter,
              options,
              isSpec
            }
            const optionsList = !this.selectedOptions[filter]
              ? []
              : this.selectedOptions[filter]
                .filter(option => options.find(({ key }) => key === option))
            this.$set(this.selectedOptions, filter, optionsList)
          }
          updatedFilters.push(filterIndex)
        }
        addFilter('Brands', this.ecomSearch.getBrands())
        addFilter('Categories', this.ecomSearch.getCategories())
        this.ecomSearch.getSpecs().forEach(({ key, options }) => {
          addFilter(key, options, true)
        })
        this.filters = this.filters.filter((_, i) => updatedFilters.includes(i))
        this.searchFilterId = Date.now()
      },
  
      updatePriceOptions () {
        this.priceRange = this.ecomSearch.getPriceRange()
        if (Math.round(this.priceRange.min) < Math.round(this.priceRange.avg)) {
          const price1 = Math.ceil(Math.max(this.priceRange.min * 1.5, this.priceRange.avg / 2))
          const price2 = Math.ceil(Math.min(this.priceRange.max / 1.5, this.priceRange.avg * 2))
          if (price1 !== price2) {
            this.priceOptions = [Math.min(price1, price2), Math.max(price1, price2), null]
              .map((max, i, prices) => {
                const min = prices[i - 1]
                return {
                  min,
                  max,
                  label: !min
                    ? `${i18n(i19upTo)} ${formatMoney(max)}`
                    : i < 2
                      ? `${formatMoney(min)} - ${formatMoney(max)}`
                      : `${i18n(i19asOf)} ${formatMoney(min)}`
                }
              })
            return
          }
        }
        this.priceOptions = []
      },
  
      handleSuggestions () {
        if (this.term) {
          const { ecomSearch } = this
          const term = this.term.toLowerCase()
          let suggestTerm = term
          let canAutoFix = false
          this.suggestedTerm = ''
          ecomSearch.getTermSuggestions().forEach(({ options, text }) => {
            if (options.length) {
              const opt = options[0]
              const optTerm = opt.text.toLowerCase()
              if (
                !this.totalSearchResults &&
                this.autoFixScore > 0 &&
                opt.score >= this.autoFixScore &&
                optTerm.indexOf(term) === -1
              ) {
                canAutoFix = true
              }
              suggestTerm = suggestTerm.replace(new RegExp(text, 'i'), optTerm)
            }
          })
          if (!this.keepNoResultsTerm) {
            this.noResultsTerm = ''
          } else {
            this.keepNoResultsTerm = false
          }
          if (suggestTerm !== term) {
            if (canAutoFix) {
              this.noResultsTerm = term
              this.keepNoResultsTerm = true
              this.$emit('update:term', suggestTerm)
            } else {
              this.suggestedTerm = suggestTerm
            }
            ecomSearch.history.shift()
          }
        }
      },
  
      handleSearchResult () {
        const { ecomSearch } = this
        this.totalSearchResults = ecomSearch.getTotalCount()
        this.resultItems = this.isLoadingMore
          ? this.resultItems.concat(ecomSearch.getItems())
          : ecomSearch.getItems()
        this.updateFilters()
        if (!this.hasSearched && this.defaultFilters) {
          for (const filter in this.defaultFilters) {
            const options = this.defaultFilters[filter]
            if (Array.isArray(options)) {
              options.forEach(option => this.setFilterOption(filter, option, true))
            } else if (typeof options === 'string') {
              this.setFilterOption(filter, options, true)
            }
          }
        }
        this.updatePriceOptions()
        this.handleSuggestions()
        if (!this.totalSearchResults && this.hasPopularItems && !this.hasSetPopularItems) {
          this.fetchItems(false, true)
        }
        this.$emit(this.isLoadingMore ? 'load-more' : 'search', { ecomSearch })
        if (!this.hasSearched) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.hasSearched = true
            }, 100)
          })
        }
      },
  
      scheduleFetch () {
        if (!this.isScheduled) {
          this.isScheduled = true
          this.$nextTick(() => {
            setTimeout(() => {
              this.fetchItems()
              this.isScheduled = false
            }, 30)
          })
        }
      },
  
      resetAndFetch () {
        resetEcomSearch(this)
        this.handlePresetedOptions()
        this.scheduleFetch()
      },
  
      toggleFilters (isVisible) {
        this.isAsideVisible = typeof isVisible === 'boolean'
          ? isVisible
          : !this.isAsideVisible
      },
  
      getFilterLabel (filter) {
        switch (filter) {
          case 'Brands':
            return i18n(i19brands)
          case 'Categories':
            return i18n(i19categories)
          default:
            if (this.gridsData) {
              const grid = this.gridsData.find(grid => grid.grid_id === filter)
              if (grid) {
                return grid.title || grid.grid_id
              }
            }
        }
        return filter
      },
  
      handlePresetedOptions () {
        ;['brands', 'categories'].forEach(prop => {
          if (this[prop] && this[prop].length) {
            const filter = prop.charAt(0).toUpperCase() + prop.slice(1)
            if (!this[`isFixed${filter}`]) {
              this.selectedOptions[filter] = this[prop]
            }
            this.updateSearchFilter(filter)
          }
        })
      },
  
      updateSearchFilter (filter) {
        const { ecomSearch } = this
        let setOptions = this.selectedOptions[filter]
        if (setOptions === undefined || !setOptions.length) {
          setOptions = null
        }
        switch (filter) {
          case 'Brands':
            if (this.isFixedBrands && this.brands) {
              setOptions = setOptions ? setOptions.concat(this.brands) : this.brands
            }
            ecomSearch.setBrandNames(setOptions)
            break
          case 'Categories':
            ecomSearch.setCategoryNames(setOptions)
            if (this.isFixedCategories && this.categories) {
              ecomSearch.mergeFilter({
                terms: {
                  'categories.name': this.categories
                }
              })
            }
            break
          default:
            ecomSearch.setSpec(filter, setOptions)
        }
      },
  
      handlePriceInputs () {
        const { inputMinPrice, inputMaxPrice } = this.$refs
        const min = Number(inputMinPrice.value) || null
        const max = Number(inputMaxPrice.value) || null
        if ((min && !max) || min <= max) {
          this.setPriceRange(min, max)
        }
        inputMinPrice.value = (min || '')
        inputMaxPrice.value = (max || '')
      },
  
      setPriceRange (min, max) {
        if (
          (min && min !== this.priceRange.min) ||
          (max && max !== this.priceRange.max)
        ) {
          this.hasSetPriceRange = true
        } else if (this.hasSetPriceRange) {
          this.hasSetPriceRange = false
        } else {
          return
        }
        this.ecomSearch.setPriceRange(min, max)
        this.scheduleFetch()
      },
  
      setFilterOption (filter, option, isSet) {
        const { selectedOptions } = this
        const optionsList = selectedOptions[filter]
        if (optionsList) {
          const optionIndex = optionsList.indexOf(option)
          if (isSet) {
            if (optionIndex === -1) {
              this.lastSelectedFilter = filter
              optionsList.push(option)
            }
          } else {
            if (optionIndex > -1) {
              optionsList.splice(optionIndex, 1)
            }
            if (!optionsList.length && this.lastSelectedFilter === filter) {
              this.lastSelectedFilter = null
            }
          }
          this.updateSearchFilter(filter)
          this.scheduleFetch()
        }
      },
  
      clearFilters () {
        const { selectedOptions } = this
        for (const filter in selectedOptions) {
          if (selectedOptions[filter]) {
            selectedOptions[filter] = []
            this.updateSearchFilter(filter)
          }
        }
        this.fetchItems()
      },
  
      setSortOrder (sort) {
        this.selectedSortOption = sort
        this.ecomSearch.setSortOrder(sort)
        if (this.page > 1) {
          this.page = 1
        } else {
          this.scheduleFetch()
        }
      }
    },
  
    watch: {
      term () {
        this.resetAndFetch()
      },
      brands () {
        this.resetAndFetch()
      },
      categories () {
        this.resetAndFetch()
      },
  
      page (page) {
        this.ecomSearch.setPageNumber(page)
        this.scheduleFetch()
      },
  
      isSearching (isSearching) {
        if (!isSearching && this.loadObserver) {
          this.$nextTick(() => {
            if (!this.mustSkipLoadMore) {
              this.loadObserver.observe()
            } else {
              setTimeout(() => scrollToElement(this.$refs.pageAnchor[0], 40), 100)
            }
          })
        }
      }
    },
  
    created () {
      resetEcomSearch(this)
      this.handlePresetedOptions()
      this.fetchItems()
    }
  }