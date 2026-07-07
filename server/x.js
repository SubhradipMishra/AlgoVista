function createCounter() {
  let count = 0; // "outer" variable
  
  return function() {
    count++; // "inner" function remembers 'count'
    return count;
  };
}

const myCounter = createCounter(); // createCounter() has finished running here
console.log(myCounter()); // 1
console.log(myCounter()); // 2 (it still remembers 'count')

const myCounter2 = createCounter();
console.log(myCounter2()) ;
console.log(myCounter2()) ;