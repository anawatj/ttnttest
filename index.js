const express = require('express');
const app = express();
const moment = require('moment');
const axios = require('axios');

const pageSize = 200;
async function  fetchData(){
    const res = await axios.get('http://3.1.189.234:8091/data/ttntest');
    return res.data;

}
async function max(){
    const rows = await fetchData();
    const max = rows.map(row=>row.data).reduce((x,y)=>x>y?x:y);
    console.log("Maximum data is ",max);
    return max;
}
async function min(){
    const rows = await fetchData();
    const min = rows.map(row=>row.data).reduce((x,y)=>x>y?y:x);
    console.log("Minimum data is ", min);
    return min;
}
async function avg(){
    const rows = await fetchData();
    const count = rows.length;
    const avg = rows.map(row=>row.data).reduce((x,y)=>x+y)/count;
    console.log("Average data is",avg.toFixed(2));
    return avg;
}
async function paging(pageNumber){
    
    const rows = await fetchData();
    if(pageNumber===undefined){
        return rows;
    }
    const items =  rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    console.log(items);
    return items;
}
function groupBy(arr) {
    var ref = {};
    var res = arr.reduce(function(arr1, o) {
        //  get month value
        var m = moment(o.timestamp).format("YYYY-MM-DD");
        // check already defined in the reference array
        if (!(m in ref)) {
        // define if not defined
          ref[m] = arr1.length;
          // push an empty array
          arr1.push([]);
        }
        o.date = m;
        // push the object into the array
        arr1[ref[m]].push(o);
        // return array refernece
        return arr1;
        // set initial value as an empty array for result
      }, []);
      return res;
}
async function produce(){
    const rows = await fetchData();
    const items = groupBy(rows);
    const lastItems = items[items.length-1];
    const tomorrowItems = lastItems.map(lastItem=>{
        let tomorrow = new Date(lastItem.timestamp);
        tomorrow.setTime(tomorrow.getTime() + (7 * 24 * 60 * 60 * 1000));
        return {
            id : '',
            timestamp : tomorrow.toISOString(),
            data : lastItem.data+(lastItem.data2),
            data2 : null ,
            date : moment(tomorrow).format("YYYY-MM-DD")
        }
    })
    const nextWeekItems = lastItems.map(lastItem=>{
        let nextWeek = new Date(lastItem.timestamp);
        nextWeek.setTime(nextWeek.getTime() + (7 * 24 * 60 * 60 * 1000));
        return {
            id : '',
            timestamp : nextWeek.toISOString(),
            data : lastItem.data+(lastItem.data2*7),
            data2 : null ,
            date : moment(nextWeek).format("YYYY-MM-DD")
        }
    });
   
    const ret = {
        'nextDayItems':tomorrowItems,
        'nextWeekItems':nextWeekItems
    };
    return ret;
    //console.log("group = ",items[items.length-1]);
}
app.get('/api/v1/items/max', async (req,res)=>{
   const d =await max();
   res.send({'max':d});
});
app.get('/api/v1/items/min',async (req,res)=>{
    const d =await min();
    res.send({'min':d});
});
app.get('/api/v1/items/avg',async (req,res)=>{
    const average = await avg();
    res.send({'average':average})
});
app.get('/api/v1/items',async (req,res)=>{
    const rows = await paging(req.query.page);
    return res.send(rows);
});
app.get('/api/v1/items/produceNextWeek',async (req,res)=>{
   const rows = await produce();
   return res.send(rows);
});
app.listen(4000,()=>{
    console.log("Listen 4000");
});

