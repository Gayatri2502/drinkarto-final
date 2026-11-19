'use client';

import { useState, type DragEvent } from 'react';
import { Snowflake, Droplets, BottleWine, Check, Citrus, GlassWater, Martini, RotateCcw, Search, Sparkles, X } from 'lucide-react';
import { knowledgePhotos } from '@/content/knowledge-media';
import FoodPairings from './food-pairings';
import { KnowledgeImage } from '@/components/knowledge-image';

type Ingredient = { id: string; name: string; amount: string; note: string };
type Step = { ingredientId: string; instruction: string };
type Recipe = { id: string; name: string; kind: 'Cocktail' | 'Zero-proof'; icon: typeof Martini; colour: string; time: string; summary: string; ingredients: Ingredient[]; steps: Step[]; finish: string };

const recipes: Recipe[] = [
  {
    id: 'citrus-gin', name: 'Citrus garden & tonic', kind: 'Cocktail', icon: Martini, colour: '#577b69', time: '4 steps',
    summary: 'A bright, botanical highball with citrus garnish.',
    ingredients: [
      { id: 'ice', name: 'Ice', amount: 'A few cubes', note: 'Chill the glass' },
      { id: 'gin', name: 'Gin', amount: '30 ml', note: 'Measure before pouring' },
      { id: 'tonic', name: 'Tonic water', amount: '90 ml', note: 'Top gently' },
      { id: 'lime', name: 'Lime wheel', amount: '1 piece', note: 'Aroma and garnish' },
    ],
    steps: [
      { ingredientId: 'ice', instruction: 'Add a few ice cubes to a tall glass.' },
      { ingredientId: 'gin', instruction: 'Measure 30 ml of gin with a jigger, then add it to the glass.' },
      { ingredientId: 'tonic', instruction: 'Slowly top with 90 ml of tonic water.' },
      { ingredientId: 'lime', instruction: 'Finish with one lime wheel on the rim.' },
    ],
    finish: 'Citrus garden & tonic is ready. Sip slowly, keep water nearby, and never drink and drive.',
  },
  {
    id: 'whisky-highball', name: 'Whisky soda highball', kind: 'Cocktail', icon: GlassWater, colour: '#a7773d', time: '4 steps',
    summary: 'A light, sparkling serve with soda water and lemon.',
    ingredients: [
      { id: 'ice', name: 'Ice', amount: 'A few cubes', note: 'Fill the glass' },
      { id: 'whisky', name: 'Whisky', amount: '30 ml', note: 'Measure carefully' },
      { id: 'soda', name: 'Soda water', amount: '90 ml', note: 'Pour gently' },
      { id: 'lemon', name: 'Lemon peel', amount: '1 strip', note: 'Express over the glass' },
    ],
    steps: [
      { ingredientId: 'ice', instruction: 'Fill a highball glass with a few ice cubes.' },
      { ingredientId: 'whisky', instruction: 'Measure 30 ml of whisky with a jigger and pour it over the ice.' },
      { ingredientId: 'soda', instruction: 'Top with 90 ml of soda water.' },
      { ingredientId: 'lemon', instruction: 'Twist a strip of lemon peel over the glass, then add it as garnish.' },
    ],
    finish: 'Whisky soda highball is ready. This recipe is an adult educational reference, not a recommendation to drink.',
  },
  {
    id: 'garden-fizz', name: 'Garden citrus fizz', kind: 'Zero-proof', icon: Citrus, colour: '#6b8d59', time: '4 steps',
    summary: 'A refreshing alcohol-free mix of orange, cranberry and soda.',
    ingredients: [
      { id: 'ice', name: 'Ice', amount: 'A few cubes', note: 'Chill the glass' },
      { id: 'orange', name: 'Orange juice', amount: '60 ml', note: 'Fresh or pasteurised' },
      { id: 'cranberry', name: 'Cranberry juice', amount: '45 ml', note: 'Add a tart note' },
      { id: 'soda', name: 'Soda water', amount: '60 ml', note: 'Keep the fizz' },
    ],
    steps: [
      { ingredientId: 'ice', instruction: 'Add a few ice cubes to a short glass.' },
      { ingredientId: 'orange', instruction: 'Measure 60 ml of orange juice and pour it over the ice.' },
      { ingredientId: 'cranberry', instruction: 'Add 45 ml of cranberry juice.' },
      { ingredientId: 'soda', instruction: 'Top with 60 ml of soda water and stir gently once.' },
    ],
    finish: 'Garden citrus fizz is ready: a zero-proof option for any table.',
  },
];

export default function RecipeGame() {
  const [recipeId, setRecipeId] = useState(recipes[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [message, setMessage] = useState('Tap an ingredient or drag it into the glass to begin.');
  const [dragging, setDragging] = useState('');
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'All' | Recipe['kind']>('All');
  const recipe = recipes.find((item) => item.id === recipeId) ?? recipes[0];
  const activeStep = recipe.steps[stepIndex];
  const done = stepIndex >= recipe.steps.length;
  const progress = done ? 100 : Math.round((stepIndex / recipe.steps.length) * 100);
  const filteredRecipes = recipes.filter((item) => {
    const searchable = `${item.name} ${item.kind} ${item.summary} ${item.ingredients.map((ingredient) => ingredient.name).join(' ')}`.toLocaleLowerCase();
    return (kindFilter === 'All' || item.kind === kindFilter) && searchable.includes(search.trim().toLocaleLowerCase());
  });

  function chooseRecipe(id: string) {
    setRecipeId(id);
    setStepIndex(0);
    setDragging('');
    setMessage('Tap an ingredient or drag it into the glass to begin.');
  }

  function addIngredient(id: string) {
    if (done) return;
    const expected = recipe.ingredients.find((item) => item.id === activeStep.ingredientId);
    if (id !== activeStep.ingredientId) {
      setMessage(`${expected?.name ?? 'Follow the current step'} comes next. Try that ingredient.`);
      return;
    }
    const currentIngredient = recipe.ingredients.find((item) => item.id === id);
    const next = stepIndex + 1;
    setStepIndex(next);
    setMessage(next >= recipe.steps.length ? recipe.finish : `${currentIngredient?.name} added. Step ${next + 1} is now unlocked.`);
  }

  function startDrag(event: DragEvent<HTMLButtonElement>, id: string) {
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
    setDragging(id);
  }

  function dropIngredient(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    setDragging('');
    if (id) addIngredient(id);
  }

  const Icon = recipe.icon;
  return <section className="recipe-game" aria-labelledby="recipe-game-title">
    <div className="recipe-game-intro"><div><span className="recipe-game-kicker"><Sparkles size={14}/> THE MIXING BENCH</span><h2 id="recipe-game-title">Make it one step at a time.</h2><p>Choose a recipe, then add the matching ingredient to unlock the next instruction. Drag or tap to play; no timer, score or sign-in.</p></div><div className="recipe-responsibility"><span>18+ educational recipes</span><p>Alcohol guidance and legal ages vary by location. Never drink and drive. Zero-proof recipes are available below.</p></div></div>

    <div className="recipe-library">
      <div className="recipe-library-title"><span>RECIPE LIBRARY</span><strong>Choose your mix</strong><span role="status" aria-live="polite">{filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}</span></div>
      <div className="recipe-library-toolbar"><label className="recipe-library-search"><Search size={16}/><span className="sr-only">Search recipes and ingredients</span><input type="search" value={search} maxLength={80} placeholder="Search recipes or ingredients…" onChange={(event) => setSearch(event.target.value)}/>{search && <button type="button" aria-label="Clear recipe search" onClick={() => setSearch('')}><X size={15}/></button>}</label><div className="recipe-kind-filters" aria-label="Filter recipe type">{(['All', 'Cocktail', 'Zero-proof'] as const).map((kind) => <button type="button" key={kind} aria-pressed={kindFilter === kind} onClick={() => setKindFilter(kind)}>{kind === 'All' ? 'All recipes' : kind === 'Cocktail' ? 'Cocktails' : 'Zero-proof'}</button>)}</div></div>
    <div className="recipe-selector" aria-label="Choose a recipe">{filteredRecipes.map((item) => {
      const RecipeIcon = item.icon;
      return <button type="button" key={item.id} className={recipeId === item.id ? 'recipe-choice active' : 'recipe-choice'} aria-pressed={recipeId === item.id} onClick={() => chooseRecipe(item.id)}><span className="recipe-choice-icon" style={{ '--recipe-colour': item.colour } as React.CSSProperties}><RecipeIcon size={18}/></span><span className="recipe-choice-copy"><small>{item.kind}</small><strong>{item.name}</strong></span><span className="recipe-choice-time">{item.time}</span></button>;
    })}{filteredRecipes.length === 0 && <div className="recipe-search-empty"><strong>No recipes found</strong><span>Try “gin”, “orange” or “zero-proof”.</span><button type="button" onClick={() => { setSearch(''); setKindFilter('All'); }}>Clear filters</button></div>}</div>
    </div>

    <div className="recipe-play-area">
      <section className="recipe-ingredients" aria-labelledby="ingredients-title"><div className="recipe-section-heading"><span className="recipe-step-number">01</span><div><h3 id="ingredients-title">Your ingredients</h3><p>All amounts are shown up front.</p></div></div><div className="ingredient-list">{recipe.ingredients.map((ingredient, index) => {
        const used = recipe.steps.slice(0, stepIndex).some((step) => step.ingredientId === ingredient.id);
        const current = !done && activeStep.ingredientId === ingredient.id;
        return <button type="button" draggable={!done} key={`${recipe.id}-${ingredient.id}`} className={`ingredient-token ${current ? 'is-current' : ''} ${used ? 'is-used' : ''} ${dragging === ingredient.id ? 'is-dragging' : ''}`} aria-label={`${ingredient.name}, ${ingredient.amount}${used ? ', added' : current ? ', current step' : ''}. Tap to add or drag to the glass.`} onClick={() => addIngredient(ingredient.id)} onDragStart={(event) => startDrag(event, ingredient.id)} onDragEnd={() => setDragging('')} disabled={done}><span className="ingredient-order">{used ? <Check size={13}/> : /ice/i.test(ingredient.name) ? <Snowflake size={20}/> : /lime|lemon|citrus/i.test(ingredient.name) ? <Citrus size={20}/> : /water|soda|tonic/i.test(ingredient.name) ? <Droplets size={20}/> : <BottleWine size={20}/>}</span><span className="ingredient-name"><strong>{ingredient.name}</strong><small>{ingredient.note}</small></span><span className="ingredient-amount">{ingredient.amount}</span></button>;
      })}</div><p className="drag-hint">Touch friendly: tap an ingredient to add it.</p></section>

      <section className="recipe-glass-zone" aria-labelledby="glass-zone-title"><div className="recipe-section-heading"><span className="recipe-step-number">02</span><div><h3 id="glass-zone-title">The glass</h3><p>{done ? 'Recipe complete' : `Step ${stepIndex + 1} of ${recipe.steps.length}`}</p></div><button type="button" className="recipe-reset" onClick={() => chooseRecipe(recipe.id)} aria-label="Restart this recipe"><RotateCcw size={15}/> Restart</button></div><div className="recipe-progress" role="progressbar" aria-label="Recipe progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }}/></div>
        <div className={`glass-drop-zone ${dragging ? 'drag-over-ready' : ''} ${done ? 'is-complete' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={dropIngredient} aria-label="Drop the ingredient here"><div className="mixing-glass"><span className="glass-glint"/><span className="glass-liquid" style={{ height: `${Math.max(0, Math.min(85, stepIndex * 19))}%`, background: recipe.colour }}/>{done ? <Check size={28}/> : <Icon size={30}/>}</div><strong>{done ? 'Nicely mixed' : dragging ? 'Release to add' : 'Glass ready'}</strong><span>{done ? 'Every step complete' : 'Drop an ingredient here'}</span></div>
        <div className="revealed-instruction" aria-live="polite" aria-atomic="true"><span className="instruction-label">{done ? 'FINISHED' : 'CURRENT INSTRUCTION'}</span><p>{done ? recipe.finish : activeStep.instruction}</p><span className="instruction-feedback">{message}</span></div>
        {done && <><RecipePreview recipe={recipe}/><FoodPairings category={recipe.kind==='Zero-proof'?'Zero-proof':recipe.id==='citrus-gin'?'Gin':'Whisky'}/></>}
      </section>
    </div>
    <div className="recipe-game-footer"><span><Check size={14}/> Each next instruction stays hidden until this one is completed.</span><span>Example measures only · Follow product labels and local law.</span></div>
  </section>;
}

function RecipePreview({ recipe }: { recipe: Recipe }) {
  const lime = recipe.id === 'citrus-gin';
  const amber = recipe.id === 'whisky-highball';
  const photograph = lime ? knowledgePhotos.ginTonic : amber ? knowledgePhotos.whiskyHighball : undefined;
  const liquid = lime ? ['#d7e3a1', '#a4bc65'] : amber ? ['#e5bd70', '#b97635'] : ['#edaa62', '#bb5b59'];
  const garnish = lime ? '#85a958' : amber ? '#e3ae48' : '#df8640';
  const gradientId = `drink-liquid-${recipe.id}`;
  return <div className="finished-recipe-preview" role="group" aria-label={`Finished drink preview for ${recipe.name}`}>
    <div className="finished-recipe-art">{photograph ? <KnowledgeImage photo={photograph} className="finished-recipe-photo" sizes="(max-width: 700px) 100vw, 360px" /> : <><span className="preview-stamp"><Check size={12}/> SERVE</span><svg viewBox="0 0 250 225" role="img" aria-label={`Illustration of finished ${recipe.name}: a chilled, garnished highball with orange and ice.`}>
      <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={liquid[0]} stopOpacity=".7"/><stop offset="1" stopColor={liquid[1]} stopOpacity=".95"/></linearGradient><clipPath id={`glass-clip-${recipe.id}`}><path d="M77 47h96l-12 118q-36 19-72 0Z"/></clipPath></defs>
      <ellipse cx="125" cy="193" rx="48" ry="7" fill="#365642" opacity=".08"/>
      <path d="M74 43h102l-13 126q-38 22-76 0Z" fill="#fff" fillOpacity=".34" stroke="#718d7b" strokeWidth="3" strokeLinejoin="round"/>
      <g clipPath={`url(#glass-clip-${recipe.id})`}><path d="M78 87h96l-9 88q-39 18-78 0Z" fill={`url(#${gradientId})`}/><path d="m94 76 28-7 18 27-26 9Zm41 4 27 6-5 26-30-7Z" fill="#fff" fillOpacity=".67" stroke="#fff" strokeOpacity=".6" strokeWidth="2"/><path d="M83 119q42 7 87-1" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="3"/><circle cx="103" cy="145" r="3" fill="#fff" opacity=".55"/><circle cx="145" cy="128" r="2.5" fill="#fff" opacity=".6"/><circle cx="133" cy="158" r="2" fill="#fff" opacity=".55"/></g>
      <path d="M84 60 72 43m93 17 13-17" stroke="#718d7b" strokeWidth="3" strokeLinecap="round"/><circle cx="174" cy="42" r="24" fill={garnish} stroke="#fff" strokeWidth="4"/><circle cx="174" cy="42" r="16" fill="#fff" fillOpacity=".22" stroke="#fff" strokeOpacity=".8" strokeWidth="2"/><path d="M174 27v30m-13-15h26m-22-11 18 22m0-22-18 22" stroke="#fff" strokeOpacity=".78" strokeWidth="1.4"/><path d="M142 22q21-12 34-4" fill="none" stroke="#65845d" strokeWidth="4" strokeLinecap="round"/><path d="M67 86q-10 28 2 48" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".65"/>
    </svg><span className="preview-art-label">ILLUSTRATIVE SERVE</span></>}</div>
    <div className="finished-recipe-caption"><span className="instruction-label">YOUR FINISHED MIX</span><strong>{recipe.name}</strong><span>{photograph ? 'Photograph of a matching serving style. Your pour and garnish may look different.' : 'Illustration of the finished drink. Glassware and garnish may vary.'}</span></div>
  </div>;
}
