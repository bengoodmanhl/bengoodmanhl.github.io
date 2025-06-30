class SpecialHeader extends HTMLElement {
    connectedCallbak() {
      this.innerHTML ='
        <p style = "display: flex">
          <a href = "index.html">Home</a>
          <a href = "page1.html">Page1</a>
          
        </p>
      '
    }
}

class SpeacialFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML='
      <p>
      </p>
    '
  }
}

customElements.define('special-header',SpecialHeader) 

customElements.define('special-footer',SpecialFooter)
          
         
