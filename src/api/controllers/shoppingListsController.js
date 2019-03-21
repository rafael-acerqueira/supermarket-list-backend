const ShoppingList = require('../models/shoppingListModel')
const Product = require('../models/productModel')

exports.list = (req, res) => {
  ShoppingList.find({}, (err, shoppingList) => {
    if(err)
      res.send(err)
    res.json(shoppingList)  
  })
}

exports.create = (req, res) => {
  const shoppingList = new ShoppingList(req.body)
  shoppingList.save((err, shoppingList) => {
    if(err)
      res.send(err)
    res.json(shoppingList)
  })
}

exports.read = (req, res) => {
  ShoppingList.findById(req.params.id, async (err, shoppingList) => {
    if(err)
      res.send(err)
    const shoppingListJSON = JSON.parse(JSON.stringify(shoppingList))
    const list = []
    await Promise.all(shoppingListJSON.items.map(async element => {
      let product = await Product.findById(element.product)
      const productJSON = JSON.parse(JSON.stringify(product))
      list.push({
        product: productJSON._id,
        productName: productJSON.name,
        quantity: element.quantity,
        value: element.value,
        found: element.found
      })
    }))
    shoppingListJSON.items = list
    res.json(shoppingListJSON)
  })
}

exports.update = (req, res) => {
  ShoppingList.findOneAndUpdate({ 
    _id: req.params.id}, 
    req.body, 
    {new:true}, 
    async (err, shoppingList) => {
      if(err)
        res.send(err)
      const shoppingListJSON = JSON.parse(JSON.stringify(shoppingList))
      const list = []
      await Promise.all(shoppingListJSON.items.map(async element => {
        let product = await Product.findById(element.product)
        const productJSON = JSON.parse(JSON.stringify(product))
        list.push({
          _id: element._id,
          product: productJSON._id,
          productName: productJSON.name,
          quantity: element.quantity,
          value: element.value,
          found: element.found
        })
      }))
      shoppingListJSON.items = list
      res.json(shoppingListJSON)
    })
}

exports.delete = (req, res) => {
  ShoppingList.deleteOne({ _id: req.params.id }, (err, shoppingList) => {
    if(err)
      res.send(err)
    res.json(shoppingList)  
  })
}

exports.nextBuy = (req, res) => {
  ShoppingList.findOne({ done: false }, async (err, shoppingList) => {
    if(err)
      res.send(err)
    const shoppingListJSON = JSON.parse(JSON.stringify(shoppingList))
    const list = []
    await Promise.all(shoppingListJSON.items.map(async element => {
      let product = await Product.findById(element.product)
      const productJSON = JSON.parse(JSON.stringify(product))
      list.push({
        _id: element._id,
        product: productJSON._id,
        productName: productJSON.name,
        quantity: element.quantity,
        value: element.value,
        found: element.found
      })
    }))
    shoppingListJSON.items = list
    res.json(shoppingListJSON)
  }).sort('-date')
}

exports.maskItemAsFound = (req, res) => {
  ShoppingList.findById( req.params.id, async (err, shoppingList) => {
    const item = shoppingList.items.id(req.params.item_id)    
    const found = !item.found
    item.set({found})
    
    shoppingList.save().then( async savedShoppingList => {
      const shoppingListJSON = JSON.parse(JSON.stringify(savedShoppingList))
      const list = []
      await Promise.all(shoppingListJSON.items.map(async element => {
        let product = await Product.findById(element.product)
        const productJSON = JSON.parse(JSON.stringify(product))
        list.push({
          _id: element._id,
          product: productJSON._id,
          productName: productJSON.name,
          quantity: element.quantity,
          value: element.value,
          found: element.found
        })
      }))
      shoppingListJSON.items = list
      res.send(shoppingListJSON)
    }).catch( err => {
      res.status(500).send(err)
    })
  })
}

exports.purchasesThisMonth = (req, res) => {  
  ShoppingList.aggregate([
    { $addFields: {  "month" : { $month: '$date' } } },
    { $match: { $and:
      [
        { month: { $eq: +req.params.month } },
        { done: { $eq: true } }
      ]
    }},
    { $count: "purchasesThisMonth"}
  ], (err, list) => {
    if(err)
      res.send(err)
    res.json(list[0] || {"purchasesThisMonth": 0 })
  })
}


exports.totalValueThisMonth = (req, res) => {  
  ShoppingList.aggregate([
    { $project: { total: { $sum: "$items.value" } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
    { $project: {_id: 0, total: 1 } }
  ], (err, list) => {
    if(err)
      res.send(err)
    console.log(list)
  })
}
