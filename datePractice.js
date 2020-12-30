
const fns = require('date-fns');

 const result = fns.format(Date.now(), 'dd/MM/yyyy')
 const daysInMonth = fns.getDaysInMonth(Date.now())
console.log(daysInMonth)