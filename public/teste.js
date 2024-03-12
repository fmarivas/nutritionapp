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



fetch('http://localhost:3000/meal-planner', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));