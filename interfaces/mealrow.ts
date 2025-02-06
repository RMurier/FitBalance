type MealRow = {
  id: number;
  name: string;
  date: string;
  food_name: string | undefined;
  calories: number | undefined;
  proteins: number | undefined;
  carbs: number | undefined;
  fats: number | undefined;
};

export default MealRow;