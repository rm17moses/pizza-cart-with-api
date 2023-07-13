
document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: "Zandile's Perfect Pizza",
            subtitle: "Order your favourite pizzas online",
            pizzas: [],
            username: "",
            cartId: "",
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: 0.00,
            message: "",
            amountDue: ' ',
            amountMessage: "",
            featuredPizzas: [],
            total: 0.00,
            cartCodes: [],
            selectedCartCode: "",
            orderPizzas: [],

            login() {
                if (this.username.length >= 3 && this.username.length <= 20) {
                    localStorage['username'] = this.username;
                    this.createCart();
                } else if (this.username.length < 3) {
                    alert("Username is too short");
                } else if (this.username.length > 20) {
                    alert("Username is too long");
                }
            },

            pizzaImage(pizza) {
              return `images/${pizza.flavour}.png`  
            },

            pizzaImage2(featured) {
                return `images/${featured.flavour}.png`  
              },

            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    localStorage['username'] = '';
                    window.location.reload();
                }
            },

            createCart() {
                if (!this.username) {
                    return Promise.resolve();
                }
                const cartId = localStorage['cartId'];

                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
                    return axios.get(createCartUrl)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        });
                }
            },

            getCart() {
                const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
                return axios.get(getCartUrl);
            },

            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                });
            },

            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                });
            },

            pay(amount) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    "cart_code": this.cartId,
                    amount
                });
            },

            setFeaturedPizza(pizzaId) {
                axios.post('https://pizza-api.projectcodex.net/api/pizzas/featured?username=rm17moses', {
                    username: 'rm17moses',
                    pizza_id: pizzaId
                }).then(() => this.getFeaturedPizzas())
            },
            getFeaturedPizzas() {
                axios.get('https://pizza-api.projectcodex.net/api/pizzas/featured?username=rm17moses')
                    .then(result => {
                        // console.log(result.data);
                        this.featuredPizzas = result.data.pizzas
                    })
            },

            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                });
            },

            orderHistory() {
                axios.get(`https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`)
                    .then(result => {
                        console.log(result.data);
                        const data = result.data;
                        this.orderPizzas = data.pizzas;
                        this.total = data.total;
                    });
            },

            fetchCartCodes() {
                axios.get(`https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.username}`)
                    .then(result => {
                        console.log(result.data);
                        this.cartCodes = result.data;
                    })
            },

            fetchOrderHistory() {
                if (this.selectedCartCode) {
                    axios.get(`https://pizza-api.projectcodex.net/api/pizza-cart/${this.selectedCartCode}/get`)
                        .then(result => {
                            console.log(result.data);
                            const data = result.data;
                            this.orderPizzas = data.pizzas; // Assign the pizzas data to orderPizzas property
                            this.total = data.total;
                        });
                } else {
                    this.orderPizzas = []; // Clear the orderPizzas data when no cart code is selected
                    this.total = 0;
                }
            },

            init() {
                const storedUsername = localStorage['username'];
                if (storedUsername) {
                    this.username = storedUsername;
                }

                axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas;
                    });

                if (!this.cartId) {
                    this.createCart().then(() => {
                        this.showCartData();
                    });
                }

                this.showCartData();
                this.getFeaturedPizzas();
                this.orderHistory();
                this.fetchCartCodes();
            },

            addPizzaToCart(pizzaId) {
                this.addPizza(pizzaId).then(() => {
                    this.showCartData();
                });
            },

            removePizzaFromCart(pizzaId) {
                this.removePizza(pizzaId).then(() => {
                    this.showCartData();
                });
            },

            payForCart() {
                this.pay(this.paymentAmount).then(result => {
                    if (result.data.status === 'failure') {
                        this.message = result.data.message;
                        this.amountMessage = ' You need R';
                        this.amountDue = (this.cartTotal - this.paymentAmount).toFixed(2) + ' extra.';
                        setTimeout(() => {
                            this.message = ' ';
                            this.amountMessage = ' ';
                            this.amountDue = ' ';
                        }, 5000);
                    } else {
                        this.message = 'Payment Successful!' + ' Your change is: R' + (this.paymentAmount - this.cartTotal).toFixed(2);
                        setTimeout(() => {
                            this.message = '';
                            this.cartPizzas = [];
                            this.cartTotal = 0.00;
                            this.cartId = '';
                            this.paymentAmount = 0;
                            localStorage['cartId'] = '';
                            this.createCart();
                            /*
                            this.featuredPizzas = [];
                            this.total = 0.00;
                            this.cartCodes = [];
                            this.selectedCartCode = "";
                            this.orderPizzas = [];*/
                            window.location.reload()
                        }, 3000);
                    }
                });
            },

        };
    });
});
