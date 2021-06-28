{var date = new Date();
console.log(date);
date.setDate(date.getDate() + 7);

var finalDate = date.getDate()+'/'+ (date.getMonth()+1) +'/'+date.getFullYear();}