import * as merge from 'lodash.merge'

export default (self, term) => {
  console.log(self)
  console.log(term)
  const modelList = [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 13 Pro Max",
    "iPhone 12 Pro Max",
    "iPhone 13 Pro",
    "iPhone 12/12 Pro",
    "iPhone 11",
    "iPhone 13",
    "iPhone 12 Mini",
    "iPhone 13 Mini",
    "iPhone 11 Pro Max",
    "iPhone X/XS",
    "iPhone 11 Pro",
    "iPhone 7 Plus",
    "iPhone XS Max",
    "iPhone 14 Pro",
    "iPhone XR",
    "iPhone 14",
    "iPhone 14 Pro Max",
    "Galaxy S21 Plus",
    "Galaxy S21 Ultra",
    "iPhone 14 Plus",
    "Galaxy S20 Plus",
    "Galaxy S21",
    "iPhone 7",
    "Galaxy S20 Ultra",
    "iPhone 6/6s",
    "iPhone 6/6s Plus",
    "iPhone 6/7/8 Plus",
    "Galaxy S8",
    "Galaxy S8 Plus",
    "iPhone SE 2020",
    "Galaxy A72",
    "Galaxy S10 Plus",
    "Galaxy S22",
    "Galaxy S22 Plus",
    "Galaxy S10e",
    "iPhone 6/7/8",
    "Galaxy A02s",
    "Galaxy A03s",
    "Galaxy A11",
    "Galaxy A12",
    "Galaxy A21s",
    "Galaxy A22 4G",
    "Galaxy A31",
    "Galaxy A32 4G",
    "Galaxy A32 5G",
    "Galaxy A51",
    "Galaxy A71",
    "Galaxy Note 20",
    "Galaxy S10",
    "Galaxy S20",
    "Galaxy S22 Ultra",
    "K41s",
    "K51s",
    "K52" 
  ]
  const findMatchingModel = (searchTerm) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    for (const model of modelList) {
        if (model.toLowerCase() === lowerSearchTerm || lowerSearchTerm.includes(model.toLowerCase())) {
            return model;
        }
    }
    return 'isNotModel';
  }
  const searchedTerm = findMatchingModel(term)
  if (searchedTerm && searchedTerm.length && searchedTerm !== 'isNotModel') {
    self.dsl.query.bool.filter.push({
      "nested": {
        "path": "specs",
        "query": {
          "bool": {
            "filter": [
              {
                "term": {
                  "specs.grid": "modelo"
                }
              },
              {
                "terms": {
                  "specs.text": [
                    searchedTerm
                  ]
                }
              }
            ]
          }
        }
      }
    })
  }
  const words = (term || '').split(/\s+/).map(word => {
    switch (word) {
      case 'iphone':
        return 'iPhone'
      case '8':
        return '7/8'
      case 'x':
      case 'x/xs':
        return 'X/XS'
      case 'xs':
        return 'XS'
      case 'xl':
        return 'XL'
      case 'a20':
      case 'a30':
      case 'a20/a30':
        return 'A20/A30'
      case 'a52':
        return 'galaxy a52 4g/5g'
      default:
        return word.charAt(0).toUpperCase() + word.substr(1)
    }
  })

  // match name and/or keyword with term
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html
  self.mergeFilter({
    bool: {
      should: [
        {
          multi_match: {
            query: term,
            fields: [
              'name',
              'keywords'
            ]
          }
        },
        {
          bool: {
            must: {
              nested: {
                path: 'specs',
                query: {
                  terms: {
                    'specs.text': [
                      words.join(' ').replace(/(samsung|apple|motorola|lg|xiaomi|huawei)\s/ig, ''),
                      ...words.filter(word => word.length > 1)
                    ]
                  }
                }
              }
            },
            boost: 3.5
          }
        }
      ]
    }
  }, 'must')

  merge(self.dsl, {
    // handle terms suggestion
    // 'did you mean?'
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html
    suggest: {
      text: term,
      words: {
        term: {
          field: 'name'
        }
      }
    }
  })

  return self
}

/**
 * @method
 * @name EcomSearch#setSearchTerm
 * @description Defines term to match with product name
 * and/or keywords on next search request.
 *
 * @param {string} term - Term to be searched
 * @returns {self}
 *
 * @example
// Set new search term
search.setSearchTerm('smartphone')
 * @example
// Set new term and run search request
search.setSearchTerm('notebook').fetch()
 */
