// Add your custom JavaScript for storefront pages here.
import lozad from 'lozad'

function setTitleCategoryProductCard() {
  let categoryTitle = $(".page-title__head h1")
    .text()
    .trim();

  $(".search-engine__retail .row > div").map(function() {
    $(this)
      .find(".product-card__name")
      .append(` / ${categoryTitle}`);
  });
}

$(document).ready(function() {
  setTitleCategoryProductCard();
});

async function loadAsync () {
  // Rdform form
if (typeof window.setupRd === 'function') {
  const observer = lozad(document.getElementById('mobifans-newsletter-b772e2c9e2e246127cfa'), {
    rootMargin: '350px 0px',
    threshold: 0,
    load () {
      const script = document.createElement('script')
      script.src = 'https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js'
      script.id = 'hs-script-loader'
      script.async = true
      script.onload = window.setupRd
      document.getElementById('mobifans-newsletter-b772e2c9e2e246127cfa').appendChild(script)
    }
  })
  observer.observe()
}

  //popup
 lozad(document.getElementById('popup-rd'), {
  rootMargin: '350px 0px',
  threshold: 0,
  load () {
    const script = document.createElement('script')
    script.src = 'https://d335luupugsy2.cloudfront.net/js/loader-scripts/327c8007-c9a1-4daa-a021-a2e6740a394f-loader.js'
    script.id = 'rd-popup'
    script.async = true
    document.getElementById('popup-rd').appendChild(script)
  }
}).observe()
}
loadAsync()