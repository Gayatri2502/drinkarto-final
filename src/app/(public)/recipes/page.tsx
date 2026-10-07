import RecipeGame from '@/components/recipe-game';

export const metadata = {
  title: 'Interactive cocktail and zero-proof recipes',
  description: 'Follow measured adult cocktail and alcohol-free recipe examples one step at a time, with matching serving photographs where available.',
};

export default function RecipesPage() {
  return <div className="public-container public-page recipes-page">
    <p className="public-eyebrow">THE RECIPE STUDIO · ADULTS 18+</p>
    <h1>Mix with curiosity.<br/><em>One small step at a time.</em></h1>
    <p className="public-intro">Explore measured cocktail and zero-proof recipes in a guided, interactive preparation game. Every instruction unlocks only after you complete the current one.</p>
    <RecipeGame />
    <p className="recipes-disclaimer">Recipes are educational serving examples, not health advice or encouragement to consume alcohol. Legal drinking ages, sales rules and product availability vary. Choose a zero-proof recipe, keep water available, and never drive after drinking.</p>
  </div>;
}
