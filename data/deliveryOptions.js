import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

export const deliveryOptions = [{
    id: '1',
    deliveryDays: 7,
    priceCents: 0
}, {
    id: '2',
    deliveryDays: 3,
    priceCents: 499
}, {
    id: '3',
    deliveryDays: 1,
    priceCents: 999
}];

export function getDeliveryOption(deliveryOptionId){
    let deliveryOption;

    deliveryOptions.forEach((option) => {
        if(option.id === deliveryOptionId){
            deliveryOption = option;
        }
    });

    return deliveryOption || deliveryOptions[0];
}


function isWeekend(date) {
    const dayOfWeek = date.format('dddd');
    return dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
}

export function calculateDeliveryDate(deliveryOption){
    
    let remainigDays = deliveryOption.deliveryDays;
    let deliveryDate = dayjs();

    while(remainigDays > 0){
        deliveryDate = deliveryDate.add(1, 'days');
        if(!isWeekend(deliveryDate)){
            remainigDays--;
        }
    }

    const dateString = deliveryDate.format(
        'dddd, MMMM D'
    );

    return dateString;
}

export function validDeliveryOption(deliveryOptionId){
    let found = false;

    deliveryOptions.forEach((option) => {
        if(option.id === deliveryOptionId){
            found = true;
        }
    });

    return found;
}

export function calculateDeliveryDateFrom(orderTime, deliveryOption){
    let orderDate = dayjs(orderTime);
    let daysAdded = 0;

    while(daysAdded < deliveryOption.deliveryDays){
        orderDate = orderDate.add(1, 'day');

        //skip weekends: 0 = Sunday, 6 = Saturday
        if(orderDate.day() !== 0 && orderDate.day() !== 6){
            daysAdded++;
        }
    }

    return orderDate;
}

// THIS CODE FOR order.js FILE
// all this code for skipping weekends from product-delivery-date
// to skip weekends we need deliveryOptions.deliveryDays 
// but the products we get from backend doesnt have deliveryOption, and we cant change backend
// so here is the code for finding an deliveryOption, which we can use in our function
function countDaysBetween(startDate, endDate) {
    // .diff is built-in method of dayjs which calculates tha difference between two dates in days
    return dayjs(endDate).diff(dayjs(startDate).startOf('day'), 'day');
}

export function findDeliveryOption(orderTime, estimatedDeliveryTime){
    const daysBetween = countDaysBetween(orderTime, estimatedDeliveryTime);
    return deliveryOptions.find(option => option.deliveryDays === daysBetween) || null;
}