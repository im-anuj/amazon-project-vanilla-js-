import { getProduct, loadProductsFetch } from "../data/products.js";
import { calculateDeliveryDateFrom, findDeliveryOption } from "../data/deliveryOptions.js";
import { orders } from "../data/orders.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";
import { formatCurrency } from "./utils/money.js";
import { cart } from "../data/cart-class.js";
import { renderHeader, updateCartQuantity } from "./shared/header.js";

renderHeader();
updateCartQuantity();

async function loadPage(){
    await loadProductsFetch(); //for getProduct();

    let ordersHTML = '';

    orders.forEach((order) => {
        
        const orderTimeString = dayjs(order.orderTime).format('MMMM D');
        ordersHTML += `
            <div class="order-container">
            
                <div class="order-header">
                    <div class="order-header-left-section">
                    <div class="order-date">
                        <div class="order-header-label">Order Placed:</div>
                        <div>${orderTimeString}</div>
                    </div>
                    <div class="order-total">
                        <div class="order-header-label">Total:</div>
                        <div>$${formatCurrency(order.totalCostCents)}</div>
                    </div>
                    </div>

                    <div class="order-header-right-section">
                    <div class="order-header-label">Order ID:</div>
                    <div>${order.id}</div>
                    </div>
                </div>

                <div class="order-details-grid">
                    ${productsListHTML(order)}
                </div>
            </div>
        `
    });

    function productsListHTML(order){
        let productsListHTML = '';
        order.products.forEach((productDetails) => {
            const productId = productDetails.productId;
            const product = getProduct(productId);
            
            const matchedOption = findDeliveryOption(order.orderTime, productDetails.estimatedDeliveryTime);
            console.log(matchedOption);

            let deliveryDate = 'undefined';
            if(matchedOption){
                const rawDate = calculateDeliveryDateFrom(order.orderTime, matchedOption);
                deliveryDate = rawDate.format('MMMM D');
            }
            productsListHTML += `
                <div class="product-image-container">
                    <img src="${product.image}">
                    </div>

                    <div class="product-details">
                    <div class="product-name">
                        ${product.name}
                    </div>
                    <div class="product-delivery-date">
                        Arriving on: ${deliveryDate}
                    </div>
                    <div class="product-quantity">
                        Quantity: ${productDetails.quantity}
                    </div>
                    <button class="buy-again-button button-primary js-buy-again" data-product-id = "${product.id}">
                        <img class="buy-again-icon" src="images/icons/buy-again.png">
                        <span class="buy-again-message">Buy it again</span>
                    </button>
                    </div>

                    <div class="product-actions">
                    <a href="tracking.html?orderId=${order.id}&productId=${product.id}">
                        <button class="track-package-button button-secondary">
                        Track package
                        </button>
                    </a>
                </div>
            `
        });

        return productsListHTML;
    }

    document.querySelector('.js-order-grid').innerHTML = ordersHTML;

    document.querySelectorAll('.js-buy-again').forEach((button) => {
        button.addEventListener('click', () => {
            cart.addToCart(button.dataset.productId, 1);

            button.innerHTML = 'Added';
            setTimeout(() => {
                button.innerHTML = `
                    <img class="buy-again-icon" src="images/icons/buy-again.png">
                    <span class="buy-again-message">Buy it again</span>
                `;
            }, 1000);
            updateCartQuantity();
        });
    });
}

loadPage();

window.addEventListener('pageshow', (event) => {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    cart.loadFromStorage();
    updateCartQuantity();
    loadPage();
  }
});
