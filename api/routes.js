const express = require('express');
const router = express.Router();
const axios = require('axios');
const NutritionUtils = require('../utils/nutritionUtils');

function getCmUnit(value) {
	if (value%1 === 0 && value >= 100) {
		return true;
	}else{
		return false
	}
}

function convertToMetric(unit, weight, height) {
    // Verifica se a unidade é imperial e realiza a conversão se necessário
    if (unit.toLowerCase() === 'imperial') {
        // Conversão de peso de libras para quilogramas (1 lb = 0.453592 kg)
        weight = weight * 0.453592;
        // Conversão de altura de polegadas para centímetros (1 in = 2.54 cm)
        height = height * 2.54;
    }

    return { weight, height };
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     responses:
 *       '200':
 *         description: Successful response
 */
 
router.get('/', (req, res) => {
    res.send('Welcome to NutriAPI!');
});


/**
 * @swagger
 * /health-stats:
 *   post:
 *     summary: To obtein Health statistics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthStatsRequest'
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatsResponse'
 *       '400':
 *         description: Bad request
 */
router.post('/health-stats', (req, res) => {
	//imperial unit: weight in pounds, height in inches		
	//metric unit: weight in KG, height in meter
	const unit = req.body.unit;
	
	const gender = req.body.gender
	const activityLevel = req.body.activity
	const age = parseInt(req.body.age)
	let weight = parseFloat(req.body.weight);
	let height = parseFloat(req.body.height);
	
	// Valida e converte automaticamente as unidades
	const convertedValues = convertToMetric(unit, weight, height);
	weight = convertedValues.weight;
	height = convertedValues.height;	
	
	if (!height || !weight || !unit || !gender || !activityLevel || !age) {
		return res.status(400).json({ error: 'Unit, Gender, Age, Height, Weight, Activity are required' });
	}
	if (!getCmUnit(height)) {
		return res.status(400).json({ error: 'Height must be in centimeter' });
	}
	
	const idealWeight = NutritionUtils.idealWeight(gender, height)
	const BMI = NutritionUtils.calculateBMI(weight, height);
	const TDEE = NutritionUtils.calculateTDEE(gender, age, weight, height, activityLevel)
	
	res.json({idealWeight, BMI, 'Macronutrients': TDEE});
});

/**
 * @swagger
 * /body-fat-percentage:
 *   post:
 *     summary: Calculate Bodyfat percentage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BodyFatPercentageRequest'
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BodyFatPercentageResponse'
 *       '400':
 *         description: Bad request
 */
router.post('/body-fat-percentage', async (req , res) =>{
	const gender = req.body.gender;
	const weight = parseFloat(req.body.weight);
	const neck = parseFloat(req.body.neck);
	const waist = parseFloat(req.body.waist);
	const height = parseFloat(req.body.height);
	const hip = parseFloat(req.body.hip);
	
	if(!gender || !weight || !neck || !waist){
		return res.status(400).json({error: 'Gender, Weight, Neck and Waist are required'})
	}
	
	if (!getCmUnit(height)) {
		return res.status(400).json({ error: 'Height must be in centimeter' });
	}
	
	if(gender.toLowerCase() === 'female' && !hip){
		return res.status(400).json({ error: 'Hip is required' });
	}
	
	if ((waist - neck) <= 0 || height <= 100) {
		return res.status(400).json({error:'Your neck cannot be greater than your waist'})
	}
		
	try{
		const BF = await NutritionUtils.calculateBF(gender, height, weight, neck, waist, hip)		
		res.json({BF})
	}catch(error){
		console.error('Error calculate your body fat percentage:', error.message);
		res.status(500).json({ error: error.message }); 		
	}
	
})

/**
 * @swagger
 * /unit-conversion/kj-to-kcal:
 *   get:
 *     summary: Convert kilojoules to kilocalories
 *     parameters:
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KjToKcalResponse'
 *       '400':
 *         description: Bad request
 */
router.get('/unit-conversion/kj-to-kcal', (req, res) => {
    const kjValue = parseFloat(req.query.value);
	
	if(!kjValue){
		return res.status(400).json({error: 'The KJ value is required'})
	}
	
    const kcalValue = NutritionUtils.convertKjToKcal(kjValue);
	
    res.json({ kj: kjValue, kcal: kcalValue });
});

/**
 * @swagger
 * /unit-conversion/sodium-to-salt:
 *   get:
 *     summary: Convert sodium to salt
 *     parameters:
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SodiumToSaltResponse'
 *       '400':
 *         description: Bad request
 */
router.get('/unit-conversion/sodium-to-salt', (req, res) => {
    const sodiumValue = parseFloat(req.query.value);
	
	if(!sodiumValue){
		return res.status(400).json({error: 'Sodium value is required'})
	}
	
    const saltValue = NutritionUtils.convertSodiumToSalt(sodiumValue);
	
    res.json({ 'sodium(mg)': sodiumValue, 'salt(g)': saltValue });
});


/**
 * @swagger
 * /ai-meal-planner:
 *   post:
 *     summary: Generate Meal Plan using AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealPlannerRequest'
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MealPlannerResponse'
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post('/ai-meal-planner', async (req, res) => {
  const { calories, macros, intolerances, diet_type, meal_count } = req.body;

  if (!calories && !macros) {
    return res.status(400).json({ error: 'You must provide either calories or macros.' });
  }

  const validDietTypes = ['vegan', 'vegetarian', 'ketogenic', 'flexible'];

  if (!diet_type || !validDietTypes.includes(diet_type.toLowerCase())) {
    return res.status(400).json({ error: 'You must provide a valid diet type: vegan, vegetarian, ketogenic, or flexible.' });
  }
  
	const user_data = {calories, macros, intolerances, diet_type, meal_count }
    
	  try {
		const mealPlan = await NutritionUtils.mealPlanner(user_data);
		res.json({mealPlan});
	  } catch (error) {
		console.error('Error generating meal plan:', error.message);
		res.status(500).json({ error: error.message }); // Retorne a mensagem de erro específica
	  }
});

/**
 * @swagger
 * /food-info/{food_name}:
 *   get:
 *     summary: Obtein nutrition information about a food
 *     parameters:
 *       - in: path
 *         name: food_name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodInfoResponse'
 *       '500':
 *         description: Internal server error
 */
router.get('/food-substitution', (req, res) =>{
	// Descrição: Este endpoint pode sugerir alternativas mais saudáveis 
	// para alimentos considerados menos saudáveis, com base em critérios 
	// nutricionais.

	// Exemplo de uso: Um usuário pode solicitar sugestões de substituição 
	// para um alimento específico, como "batata frita", e receber uma lista 
	// de opções mais saudáveis, como "batata assada" ou "palitos de legumes".	
	
})

router.get('/food-info/:food_name', async (req, res) => {
    const foodName = req.params.food_name;
    try {
        const foodInfo = await NutritionUtils.getFoodInfo(foodName);
        res.json(foodInfo);
    } catch (error) {
        console.error('Error fetching food info:', error.message);
        res.status(500).json({ error: 'Failed to fetch food info' });
    }
});


/**
 * @swagger
 * components:
 *   schemas:
 *     HealthStatsRequest:
 *       type: object
 *       required:
 *         - unit
 *         - gender
 *         - activity
 *         - age
 *         - weight
 *         - height
 *       properties:
 *         unit:
 *           type: string
 *         gender:
 *           type: string
 *         activity:
 *           type: string
 *         age:
 *           type: integer
 *         weight:
 *           type: number
 *         height:
 *           type: number
 *     HealthStatsResponse:
 *       type: object
 *       properties:
 *         idealWeight:
 *           type: number
 *         BMI:
 *           type: number
 *         Macronutrients:
 *           type: object
 *     BodyFatPercentageRequest:
 *       type: object
 *       required:
 *         - gender
 *         - weight
 *         - neck
 *         - waist
 *         - height
 *       properties:
 *         gender:
 *           type: string
 *         weight:
 *           type: number
 *         neck:
 *           type: number
 *         waist:
 *           type: number
 *         height:
 *           type: number
 *         hip:
 *           type: number
 *     BodyFatPercentageResponse:
 *       type: object
 *       properties:
 *         BF:
 *           type: number
 *     KjToKcalResponse:
 *       type: object
 *       properties:
 *         kj:
 *           type: number
 *         kcal:
 *           type: number
 *     SodiumToSaltResponse:
 *       type: object
 *       properties:
 *         'sodium(mg)':
 *           type: number
 *         'salt(g)':
 *           type: number
 *     MealPlannerRequest:
 *       type: object
 *       properties:
 *         calories:
 *           type: number
 *         macros:
 *           type: object
 *         intolerances:
 *           type: array
 *           items:
 *             type: string
 *         diet_type:
 *           type: string
 *         meal_count:
 *           type: integer
 *     MealPlannerResponse:
 *       type: object
 *       properties:
 *         mealPlan:
 *           type: object
 *     FoodInfoResponse:
 *       type: object
 */
module.exports = router;