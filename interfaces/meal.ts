type Meal = {
  id: number;
  name: string;
  date: string;
  items: { name: string; calories: number | undefined; proteins: number | undefined; carbs: number | undefined; fats: number | undefined }[];
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
};

export default Meal;