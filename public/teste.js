const data = {
	"calories": 2000,
	"macros": {
		"prots": 150,
		"carbs": 200,
		"fats": 70
	},
	"intolerances": ["lactose", "gluten"],
	"diet_type": "flexible",
	"meal_count": 3
}



fetch('https://nutriapi-bea366ebb4e9.herokuapp.com/meal-planner', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));