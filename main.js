const { createApp } = Vue;

createApp({
  data() {
    return {
      contador: 0,
      menuAberto: false,
      produtos: [
        { id: 1, nome: 'Caderno', preco: 15.00 },
        { id: 2, nome: 'Apontador', preco: 1.20 },
        { id: 3, nome: 'Estojo', preco: 8.50 }
      ],
      carrinho: []
    };
  },
  methods: {
    adicionarCarrinho(p) {
      this.carrinho.push(p);
    },
    removerCarrinho(idx) {
      this.carrinho.splice(idx, 1);
    }
  }
}).mount('#app');