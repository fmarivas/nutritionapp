require('dotenv').config();
const axios = require('axios')
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

class NutritionUtils {
    static calculateBMI(weight, height, unit) {
        let weight_status_by_BMI;
		let BMI;
		
		height = height/100
		
		BMI = parseFloat((parseFloat(weight)/Math.pow(parseFloat(height),2)).toFixed(1))
		
		if(BMI < 18.5){
			weight_status_by_BMI = 'Underweight'
		}else if(BMI >= 18.5 && BMI < 25){
			weight_status_by_BMI = 'Normal Weight'
		}else if(BMI >=25 && BMI < 30){
			weight_status_by_BMI = 'Overweight'
		}else if(BMI >=30){
			weight_status_by_BMI = 'Obese'
		}
		return {BMI,weight_status_by_BMI};
    }
	
	
	static calculateTDEE(gender, age, weight, height, activityLevel) {
		let bmr;
		let totalCalories;

		// Aplicar a fórmula Mifflin-St Jeor
		switch (gender) {
			case 'Male':
				bmr = 10 * weight + 6.25 * height - 5 * age + 5;
				break;
			case 'Female':
				bmr = 10 * weight + 6.25 * height - 5 * age - 161;
				break;
			default:
				return false; // Retorna false se o sexo não for válido
		}

		// Ajuste para o nível de atividade
		switch (activityLevel) {
			case 'sedentary':
				totalCalories = bmr * 1.2;
				break;
			case 'lightly-active':
				totalCalories = bmr * 1.375;
				break;
			case 'moderately-active':
				totalCalories = bmr * 1.55;
				break;
			case 'very-active':
				totalCalories = bmr * 1.725;
				break;
			case 'extremely-active':
				totalCalories = bmr * 1.9;
				break;
			default:
				return false; // Retorna false se o nível de atividade não for válido
		}
		
		const cuttingCal = parseFloat((totalCalories*.9).toFixed(0))
		const maintenanceCal = parseFloat((totalCalories).toFixed(0))
		const bulkCal = parseFloat((totalCalories*1.1).toFixed(0))
		
		const Maintenance ={
			kcal: maintenanceCal,
			'Moderate Carb':{
				protein: parseFloat((maintenanceCal*.3/4).toFixed(0)),
				carbs: parseFloat((maintenanceCal*.35/4).toFixed(0)),
				fats: parseFloat((maintenanceCal*.35/9).toFixed(0)),
			},
			'Lower Carb':{
				protein: parseFloat((maintenanceCal*.4/4).toFixed(0)),
				carbs: parseFloat((maintenanceCal*.4/4).toFixed(0)),
				fats: parseFloat((maintenanceCal*.2/9).toFixed(0)),
			},
			'Higher Carb':{
				protein: parseFloat((maintenanceCal*.3/4).toFixed(0)),
				carbs: parseFloat((maintenanceCal*.5/4).toFixed(0)),
				fats: parseFloat((maintenanceCal*.2/9).toFixed(0)),
			},
		}
		
		const Cutting ={
			kcal: cuttingCal,
			'Moderate Carb':{
				protein: parseFloat((cuttingCal*.3/4).toFixed(0)),
				carbs: parseFloat((cuttingCal*.35/4).toFixed(0)),
				fats: parseFloat((cuttingCal*.35/9).toFixed(0)),
			},
			'Lower Carb':{
				protein: parseFloat((cuttingCal*.4/4).toFixed(0)),
				carbs: parseFloat((cuttingCal*.4/4).toFixed(0)),
				fats: parseFloat((cuttingCal*.2/9).toFixed(0)),
			},
			'Higher Carb':{
				protein: parseFloat((cuttingCal*.3/4).toFixed(0)),
				carbs: parseFloat((cuttingCal*.5/4).toFixed(0)),
				fats: parseFloat((cuttingCal*.2/9).toFixed(0)),
			},
		}
		
		const Bulking ={
			kcal: bulkCal,
			'Moderate Carb':{
				protein: parseFloat((bulkCal*.3/4).toFixed(0)),
				carbs: parseFloat((bulkCal*.35/4).toFixed(0)),
				fats: parseFloat((bulkCal*.35/9).toFixed(0)),
			},
			'Lower Carb':{
				protein: parseFloat((bulkCal*.4/4).toFixed(0)),
				carbs: parseFloat((bulkCal*.4/4).toFixed(0)),
				fats: parseFloat((bulkCal*.2/9).toFixed(0)),
			},
			'Higher Carb':{
				protein: parseFloat((bulkCal*.3/4).toFixed(0)),
				carbs: parseFloat((bulkCal*.5/4).toFixed(0)),
				fats: parseFloat((bulkCal*.2/9).toFixed(0)),
			},
		}
		
		return {'TDEE': totalCalories, Maintenance, Cutting, Bulking}; // Retorna o total de calorias calculado
	}

	
	static idealWeight(gender, height){
		//Convertendo altura em polegadas
		const height_inches = height * 0.393701;
		
		let peso_ideal_hamwi;
		let peso_ideal_devine;
		let peso_ideal_robinson;
		let peso_ideal_miller;
		
		switch (gender){
			case 'Male':
				peso_ideal_hamwi = 48 + 2.7 * (height_inches - 60);
				peso_ideal_devine = 50 + 2.3 * (height_inches - 60);
				peso_ideal_robinson = 52 + 1.9 * (height_inches - 60);
				peso_ideal_miller = 56.2 + 1.41 * (height_inches - 60);
				break;
			case 'Female':
				peso_ideal_hamwi = 45.5 + 2.2 * (height_inches - 60);
				peso_ideal_devine = 50 + 2.3 * (height_inches - 60);
				peso_ideal_robinson = 49 + 1.7 * (height_inches - 60);
				peso_ideal_miller = 53.1 + 1.36 * (height_inches - 60);
				break;
			default:
				return false;
		}
		
		const max_weight = (Math.max (peso_ideal_devine, peso_ideal_hamwi, peso_ideal_miller, peso_ideal_robinson)).toFixed(2)
		const min_weight = (Math.min (peso_ideal_devine, peso_ideal_hamwi, peso_ideal_miller, peso_ideal_robinson)).toFixed(2)
		
		return {'Ideal Weight': min_weight +' - '+ max_weight}
				
	}
	
	static calculateBF(gender, height, weight, neck, waist, hip) {
		if ((waist - neck) === 0 || height === 0) {
			return null; // Se as medidas forem inválidas, retorne null
		}

		const bfFormula = (gender.toLowerCase() === 'male') ?
			(495) / (1.033 - 0.191 * Math.log10(waist - neck) + 0.155 * Math.log10(height)) - 450 :
			(495) / (1.296 - 0.350 * Math.log10(hip + waist + neck) + 0.221 * Math.log10(height)) - 450;

		const bf = parseFloat(bfFormula.toFixed(2));

		const bfRanges = {
			male: {
				essentialFat: [null, 6],
				athletes: [6, 14],
				fitness: [14, 18],
				average: [18, 25],
				overweight: [25, 32],
				obese: [32, Infinity]
			},
			female: {
				essentialFat: [null, 14],
				athletes: [14, 21],
				fitness: [21, 25],
				average: [25, 32],
				overweight: [32, 39],
				obese: [39, Infinity]
			}
		};

		const status = Object.entries(bfRanges[gender.toLowerCase()])
			.find(([_, range]) => bf >= range[0] && bf < range[1]);

		return { bf, status: status ? status[0] : 'Unknown' };
	}
	


	static async getFoodInfo(foodName) {
		const apiKey = process.env.track_apiKey;
		const appID = process.env.track_appID;
		
		const requestData = {
			query: foodName,
		};

		const apiEndpoint = 'https://trackapi.nutritionix.com/v2/natural/nutrients';

		try {
			const response = await axios.post(apiEndpoint, requestData, {
				headers: {
					'Content-Type': 'application/json',
					'x-app-id': appID,
					'x-app-key': apiKey
				}
			});

			const data = response.data
			
			 const foodInfo = data.foods[0];
			  return {
				food_name: foodInfo.food_name,
				serving_size: {
				  quantity: foodInfo.serving_qty,
				  unit: foodInfo.serving_unit
				},
				calories: foodInfo.nf_calories,
				macronutrients: {
				  total_fat: foodInfo.nf_total_fat,
				  saturated_fat: foodInfo.nf_saturated_fat,
				  total_carbohydrate: foodInfo.nf_total_carbohydrate,
				  sugars: foodInfo.nf_sugars,
				  dietary_fiber: foodInfo.nf_dietary_fiber,
				  protein: foodInfo.nf_protein,
				  sodium: foodInfo.nf_sodium,
				  cholesterol: foodInfo.nf_cholesterol,
				},
				micronutrients: {
				  potassium: foodInfo.nf_potassium,
				  phosphorus: foodInfo.nf_p
				},
				vitamins: {
				  vitamin_c: foodInfo.full_nutrients.find(nutrient => nutrient.attr_id === 401)?.value || 0,
				  vitamin_d: foodInfo.full_nutrients.find(nutrient => nutrient.attr_id === 324)?.value || 0
				},
				minerals: {
				  calcium: foodInfo.full_nutrients.find(nutrient => nutrient.attr_id === 301)?.value || 0,
				  iron: foodInfo.full_nutrients.find(nutrient => nutrient.attr_id === 303)?.value || 0
				},
				tags: {
				  item: foodInfo.tags.item,
				  measure: foodInfo.tags.measure,
				  quantity: foodInfo.tags.quantity,
				  food_group: foodInfo.tags.food_group
				},
				photo: {
				  thumb: foodInfo.photo.thumb,
				  highres: foodInfo.photo.highres,
				  is_user_uploaded: foodInfo.photo.is_user_uploaded
				}
			  };


		} catch (error) {
			console.error('Error fetching food info:', error.message);
			throw error;
		}
	}
	
	static async mealPlanner(user_data){
		const { calories, macros, intolerances, diet_type, meal_count } = user_data;		
		const message = `You are a diet assistant.\nGenerate a menu in direct format (without introduction, observations, or conclusions, only the Meals, without writing the name of the meal, just organize in meals and their respective number and at the end say "Thank you") for a ${diet_type} diet based on the following information:\n- Number of Meals: ${meal_count}\n- Food Intolerance: ${intolerances}\n- Calories: ${calories}\n- Carbohydrates: ${macros.carbs}g\n- Proteins: ${macros.prots}g\n- Fats: ${macros.fats}g`;
		
		try{
			const completion = await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: [
					{ role: "system", content: "You are a diet assistant." },
					{ role: "user", content: message }
				]
			});

			// Exiba a primeira escolha de conclusão
			return (completion.choices[0].message.content);
		}catch (error){
			console.error('Error:', error);
			throw new Error('Failed to generate meal plan');
		}
	}
	
	static convertKjToKcal(kj) {
		// Conversão de Kj para Kcal: 1 kJ ≈ 0.239 kcal
		const kcal = parseFloat((kj * 0.239).toFixed(0));
		return kcal;
	}

	static convertSodiumToSalt(sodium) {
		// Conversão de sódio para sal: 1 mg de sódio ≈ 2,5 mg de sal (cloreto de sódio)
		const salt = (sodium * 2.5)/1000;
		return salt;
	}
	
}

module.exports = NutritionUtils;
