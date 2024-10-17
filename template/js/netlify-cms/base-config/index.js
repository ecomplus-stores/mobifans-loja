import getSections from "@ecomplus/storefront-template/template/js/netlify-cms/base-config/sections"
import getSettings from "@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/settings"
import getLayout from "@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/layout"
import getPages from "@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/pages"
import getBlogPosts from "@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/blog-posts"
import getExtraPages from "@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/extra-pages"
import getWidgets from "@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/widgets"

//CUSTOM MODULES
import getCases from './collections/capas'

export default options => {
  options.state.routes.push({
    "resource": "products",
    "_id": "62979b6bac0cb4200ffa4a88",
    "path": "/seed-eco-case-apple",
    "sku": "2009-1"
  })
  console.log(options.state.routes.filter(({sku}) => sku === '2009-1'))
  options.sections = getSections(options).concat([
    {
        label: "Faq por categoria",
        name: "faq",
        widget: "object",
        icon: "https://api.iconify.design/bi:grid.svg",
        fields: [
            {
                label: "Faqs",
                name: "faq-list",
                widget: "list",
                fields: [
                    {
                        label: "Slug da categoria/marca",
                        hint: "Será inserido com base no link da página destino ou se no produto tiver a categoria/marca",
                        name: "slug",
                        widget: "string",
                        required: false
                    },
                    {
                        label: "Texto do faq",
                        required: false,
                        name: "text",
                        widget: "markdown"
                    }
                ]
            }
        ]
    },
    {
      label: "Lista compre junto",
      name: "buy_together_list",
      widget: "object",
      fields: [
          {
              label: "Lista compre junto",
              name: "buy_list",
              widget: "list",
              fields: [
                  {
                      label: "Slug da categoria",
                      hint: "Será inserido com base no produto tiver a categoria",
                      name: "slug",
                      widget: "string",
                      required: false
                  },
                  {
                    label: 'Produtos',
                    name: 'products',
                    widget: 'list',
                    field: {
                      label: 'SKU do produto',
                      name: 'product_id',
                      widget: 'select',
                      options: options.state.routes
                        .filter(({ sku }) => typeof sku === 'string')
                        .map(({ _id, sku }) => ({
                          label: sku,
                          value: _id
                        }))
                    }
                  },
                  {
                    label: "Desconto compre junto fixo",
                    hint: "Insira o desconto fixo baseado em se comprar a capa, qual desconto será dado no produto adicional",
                    name: "discount",
                    widget: "number",
                    required: false
                  }
              ]
          }
      ]
  },
  {
    "label": "Grid de categorias",
    "name": "categories-carousel",
    "widget": "object",
    "fields": [
        {
            "label": "Banners",
            "name": "banners",
            "widget": "list",
            "fields": [
                {
                    "label": "Imagem",
                    "name": "img",
                    "widget": "image"
                },
                {
                    "label": "Link",
                    "required": false,
                    "name": "link",
                    "widget": "string"
                },
                {
                    "label": "Alt",
                    "required": false,
                    "name": "alt",
                    "widget": "string"
                }
            ]
        },
        {
            "label": "Carousel autoplay",
            "required": false,
            "name": "autoplay",
            "hint": "Exibição de cada página em milisegundos, 0 desativa o autoplay",
            "min": 0,
            "step": 1000,
            "widget": "number"
        },
        {
          "label": "Título da estante de banner",
          "required": false,
          "name": "title",
          "widget": "string"
      }
    ]
  },
  {
    "label": "Grid de banners com Texto",
    "name": "banners-carousel",
    "widget": "object",
    "fields": [
        {
            "label": "Banners",
            "name": "banners",
            "widget": "list",
            "fields": [
                {
                    "label": "Imagem",
                    "name": "img",
                    "widget": "image"
                },
                {
                    "label": "Link",
                    "required": false,
                    "name": "link",
                    "widget": "string"
                },
                {
                    "label": "Descrição",
                    "required": false,
                    "name": "markdown",
                    "widget": "markdown",
                },
                {
                  "label": "Cor de fundo",
                  "name": "background",
                  "required": false,
                  "widget": "color",
                },
                {
                  "label": "Cor da fonte",
                  "name": "color",
                  "required": false,
                  "widget": "color"
                }
            ]
        }
    ]
  },
  {
    label: 'Lista de Posts do Blog',
    name: 'blog-grid',
    widget: 'object',
    fields: [
      {
        "label": "Grid blog",
        "name": "blog-grid",
        "widget": "list",
        "fields": [
            {
                "label": "Banners",
                "name": "banners",
                "widget": "list",
                "fields": [
                    {
                        "label": "Imagem",
                        "name": "img",
                        "widget": "image",
                        "required": false
                    },
                    {
                        "label": "Link",
                        "required": false,
                        "name": "link",
                        "widget": "string"
                    },
                    {
                        "label": "Alt",
                        "required": false,
                        "name": "alt",
                        "widget": "string"
                    },
                    {
                      "label": "Frase de chamada blog",
                      "required": false,
                      "name": "phrase_blog",
                      "widget": "string"
                    },
                    {
                      "label": "Texto de chamada blog",
                      "required": false,
                      "name": "text_blog",
                      "widget": "string"
                    }
                ]
            },
            {
              "label": "Slug categoria",
              "required": false,
              "name": "title",
              "widget": "string"
          }
        ]
      }
    ]
  },
  {
    label: 'FAQ 2',
    name: 'mgnr_faq',
    widget: 'object',
    fields: [
      {
        label: 'Lista de faqs',
        name: 'mgnr_faq_list',
        widget: 'list',
        fields: [
          {
            label: 'Título',
            required: false,
            name: 'title',
            widget: 'string'
          },
          {
            label: 'Descrição',
            required: false,
            name: 'description',
            widget: 'text'
          },
          {
            label: 'Posição da descrição',
            required: false,
            name: 'list',
            widget: 'select',
            options: ["description_first","description_last"]
          },        
          {
            label: 'Perguntas',
            name: 'questions',
            widget: 'list',
            required:false,
            fields: [
              {
                label: 'Pergunta',
                name: 'question',
                widget: 'object',
                required:false,
                fields: [
                  {
                    label: 'Pergunta',
                    name: 'title',
                    widget: 'string'          
                  },
                  {
                    label: 'Resposta',
                    name: 'response',
                    widget: 'string'          
                  }              
                ]
              },          
            ]
          },
          {
            label: 'Escolha a categoria',
            name: 'category',
            widget: 'select',
            required: false,
            options: options.state.routes
            .filter(el => el.resource === 'categories')
            .map((el) => ({
              label: el.name,
              value: el.slug || el._id
            }))
          }
        ]
      }    
    ]
  }
  ])
  console.log(options)
  options.layout = getLayout(options)
  if (options.layout && options.layout.files && options.layout.files.length) {
    options.layout.files.map(file => {
      if (file && file.name === 'header') {
        file.fields.push({
          label: 'Lista de filtros',
          name: 'filter-list',
          widget: 'object',
          icon: 'https://api.iconify.design/mdi:copyright.svg',
          required: false,
          fields: [
              {
                  label: 'Lista de filtros',
                  name: 'filters',
                  widget: 'list',
                  required: false,
                  fields: [
                      {
                          label: 'Opção do filtro',
                          name: 'filter_option',
                          widget: 'string',
                          required: false
                      },
                      {
                          label: 'Marca',
                          name: 'filter_grid_model',
                          widget: 'string',
                          required: false
                      },
                      {
                        label: 'Proteção',
                        name: 'filter_grid_protection',
                        widget: 'string',
                        hint: 'Se houver proteção especificada',
                        required: false
                      },
                      {
                        label: 'Selo Novo',
                        name: 'is_new',
                        widget: 'boolean',
                        hint: 'Será inserido selo de novo, se marcado como ativo',
                        required: false
                      }
                  ]
              },
            {
              name: 'title',
              widget: 'string',
              required: false,
              label: 'Nome da lista de Filtros'
            }
          ]
      })
      file.fields.push({
        label: 'Ordenação Submenu',
        name: 'submenu_order',
        widget: 'list',
        icon: 'https://api.iconify.design/mdi:copyright.svg',
        required: false,
        fields: [
          {
            label: 'Categoria pai slug',
            name: 'submenu_slug',
            widget: 'select',
            required: false,
            options: options.state.routes
            .filter(el => el.resource === 'categories')
            .map((el) => ({
              label: el.name,
              value: el.path
            }))
          },
            {
                label: 'Ordenação do Submenu',
                name: 'submenu',
                widget: 'list',
                required: false,
                fields: [
                  {
                    label: 'Slug da subcategoria',
                    name: 'subcategory_slug',
                    widget: 'select',
                    required: false,
                    options: options.state.routes
                    .filter(el => el.resource === 'categories')
                    .map((el) => ({
                      label: el.name,
                      value: el.path
                    }))             
                  }
                    
                ]
            }
        ]
      })
        const stripe = file.fields.find(field => field.name === 'marketing_stripe')
        if (stripe) {
          stripe.fields = [{
            "label": "Market header list",
            "name": "market_list",
            "widget": "list",
            "fields": [
              {
                "label": "Texto",
                "name": "texto",
                "widget": "string",
                "required": false
              },
              {
                "label": "Link",
                "required": false,
                "name": "link",
                "widget": "string"
              }
            ]
          },
          {
            "label": "Slider autoplay",
            "name": "autoplay",
            "hint": "Exibição de cada slide em milisegundos, defina 0 para desabilitar autoplay",
            "min": 0,
            "step": 1000,
            "default": 9000,
            "widget": "number"
          },
          {
            "label": "Cor de fundo",
            "name": "background",
            "required": false,
            "widget": "color",
            "hint": "A cor primária da loja é usada por padrão"
          },
          {
            "label": "Cor da fonte",
            "name": "color",
            "required": false,
            "widget": "color"
          }
          ] 
        }
      }
      if (file && file.name === 'menu') {
        const menuCategory = file.fields.find(field => field.name === 'sort_categories')
        if (menuCategory) {
          menuCategory.field = {
                    label: 'Categoria/Coleção/Marca',
                    name: 'slug',
                    widget: 'select',
                    required: false,
                    options: options.state.routes
                      .filter(({ resource, name }) => resource !== 'products')
                      .map(({ name, path }) => ({
                        label: name,
                        value: path.slice(1)
                      }))             
                  }
        }
        file.fields.push({
          label: 'Configurações menu',
          name: 'menu-comprar',
          widget: 'object',
          required: false,
          fields: [
            {
              name: 'title',
              widget: 'string',
              required: false,
              label: 'Texto comprar'
            }
          ]
      })
      file.fields.push({
        label: 'Ordenação Submenu',
        name: 'submenu_menu_order',
        widget: 'list',
        icon: 'https://api.iconify.design/mdi:copyright.svg',
        required: false,
        fields: [
          {
            label: 'Categoria pai slug',
            name: 'submenu_menu_slug',
            widget: 'select',
            required: false,
            options: options.state.routes
            .filter(el => el.resource === 'categories')
            .map((el) => ({
              label: el.name,
              value: el.path
            }))
          },
            {
                label: 'Ordenação do Submenu',
                name: 'submenu_menu',
                widget: 'list',
                required: false,
                fields: [
                  {
                    label: 'Slug da subcategoria',
                    name: 'subcategory_menu_slug',
                    widget: 'select',
                    required: false,
                    options: options.state.routes
                    .filter(el => el.resource === 'categories')
                    .map((el) => ({
                      label: el.name,
                      value: el.path
                    }))             
                  }
                    
                ]
            }
        ]
    })
      }
      return file
    })
  }


  return {
    backend: {
      name: "git-gateway",
      branch: "master",
      commit_messages: {
        create: "Create {{collection}} “{{slug}}”",
        update: "Update {{collection}} “{{slug}}”",
        delete: "Delete {{collection}} “{{slug}}”",
        uploadMedia: "Upload “{{path}}”",
        deleteMedia: "[skip ci] Delete “{{path}}”",
        openAuthoring: "{{message}}"
      }
    },
    logo_url: "https://ecom.nyc3.digitaloceanspaces.com/storefront/cms.png",
    locale: "pt",
    load_config_file: Boolean(window.CMS_LOAD_CONFIG_FILE),
    media_folder: `${options.baseDir}template/public/img/uploads`,
    public_folder: "/img/uploads",
    slug: {
      encoding: "ascii",
      clean_accents: true,
      sanitize_replacement: "-"
    },
    collections: [
      getSettings(options),
      getPages(options),
      options.layout,
      getBlogPosts(options),
      getCases(options),
      getExtraPages(options),
      getWidgets(options),
      {
        name: 'category_list',        
        label: 'Lista de itens por categoria',
        description: 'Configure a lista de produtos em sequência para listagem da busca',
        folder: `${options.baseDir}content/category_list`,
        extension: 'json',
        create: true,
        slug: '{{slug}}',
        fields: [
          {
            label: "Título do Registro",
            hint: "Insira o slug da categoria",
            name: "title",
            widget: "string"          
          }, 
          {
            label:"Lista de skus",
            name:"list",
            widget:"list",
            required:false,
            fields: [
              {
                label: 'SKU do produto',
                name: 'product_id',
                widget: 'select',
                options: options.state.routes
                  .filter(({ sku }) => typeof sku === 'string')
                  .map(({ _id, sku }) => ({
                    label: sku,
                    value: _id
                  }))               
              },             
            ]
          }
        ]
      },
      {
        name: 'buy_together_list',        
        label: 'Lista de compre junto para toda loja',
        description: 'Configure a lista de produtos em sequência para listagem da busca',
        folder: `${options.baseDir}content/buy_together_list`,
        extension: 'json',
        create: true,
        slug: '{{slug}}',
        fields: [
          {
              label: "Lista compre junto",
              name: "buy_list",
              widget: "list",
              fields: [
                  {
                      label: "Slug da categoria",
                      hint: "Será inserido com base no produto tiver a categoria",
                      name: "slug",
                      widget: "string",
                      required: false
                  },
                  {
                    label: 'Produtos',
                    name: 'products',
                    widget: 'list',
                    field: {
                      label: 'SKU do produto',
                      name: 'product_id',
                      widget: 'select',
                      options: options.state.routes
                        .filter(({ sku }) => typeof sku === 'string')
                        .map(({ _id, sku }) => ({
                          label: sku,
                          value: _id
                        }))
                    }
                  },
                  {
                    label: "Desconto compre junto fixo",
                    hint: "Insira o desconto fixo baseado em se comprar a capa, qual desconto será dado no produto adicional",
                    name: "discount",
                    widget: "number",
                    required: false
                  }
              ]
          }
      ]
      }
    ]
  }
}
