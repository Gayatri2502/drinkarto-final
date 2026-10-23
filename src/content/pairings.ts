export const pairingIdeas:Record<string,{name:string;description:string;colour:string}[]>={
 Whisky:[{name:'Grilled mushrooms',description:'Earthy mushrooms and gentle char can complement oak-led aromas. Keep chilli moderate.',colour:'#a6784c'},{name:'Paneer tikka',description:'A lightly spiced vegetarian option; smoky notes can echo grilled flavours.',colour:'#d19a43'}],
 Gin:[{name:'Citrus salad',description:'Citrus and fresh herbs can echo botanical aromas. Adjust acidity to your taste.',colour:'#76a55f'},{name:'Herbed grilled fish',description:'A delicate, herb-led pairing; check fish and other dietary allergens.',colour:'#8faba4'}],
 Wine:[{name:'Vegetable antipasti',description:'Roasted vegetables suit many dry styles; acidity, sweetness and sauce change the pairing.',colour:'#a65b70'},{name:'Cheese & crackers',description:'Try a mild cheese first. Match intensity and check dairy and gluten allergens.',colour:'#d2b164'}],
 Beer:[{name:'Roasted chickpeas',description:'A crunchy vegetarian side with gentle seasoning; adjust salt and spice.',colour:'#c6a052'}],
 Rum:[{name:'Grilled pineapple',description:'Caramelised fruit can echo fruit and oak aromas in some aged rum styles.',colour:'#d9ab48'}],
 'Zero-proof':[{name:'Vegetable skewers',description:'Grilled vegetables and a citrus dressing suit fresh, alcohol-free highballs.',colour:'#73a779'},{name:'Hummus & vegetables',description:'A creamy, savoury side with crisp vegetables; contains sesame.',colour:'#bfa66f'}]
};
export function foodPairings(category:string){return pairingIdeas[category]??pairingIdeas['Zero-proof'];}
