'use client'

import { useState, useEffect } from 'react'
import type { CurrentKegStatus, BrewfatherRecipe } from '@/lib/types'
import { formatAbv, formatIbu } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import BeerGlass from './BeerGlass'
import styles from './TapTower.module.scss'

interface TapTowerProps {
  towerNumber: number
  taps: (CurrentKegStatus | null)[]
  onKegUpdate?: (kegId: string, updates: Partial<CurrentKegStatus>) => void
}

export default function TapTower({ towerNumber, taps, onKegUpdate }: TapTowerProps) {
  const [showRecipeSelector, setShowRecipeSelector] = useState(false)
  const [selectedTap, setSelectedTap] = useState<{ tower: number; position: number } | null>(null)

  const handleTapClick = (position: number) => {
    setSelectedTap({ tower: towerNumber, position })
    setShowRecipeSelector(true)
  }

  const handleCloseRecipeSelector = () => {
    setShowRecipeSelector(false)
    setTimeout(() => setSelectedTap(null), 300)
  }

  const handleSelectRecipe = async (recipe: BrewfatherRecipe) => {
    if (!selectedTap) return

    try {
      const { error: kickError } = await (supabase
        .from('kegs') as any)
        .update({ is_active: false, kicked_at: new Date().toISOString() })
        .eq('tower_number', selectedTap.tower)
        .eq('tap_position', selectedTap.position)
        .eq('is_active', true)

      if (kickError) throw kickError

      const { error } = await supabase
        .from('kegs')
        .insert({
          name: recipe.name,
          beer_name: recipe.name,
          brewery: recipe.author || '',
          style: recipe.style?.name || 'Custom',
          abv: recipe.abv ? parseFloat(String(recipe.abv)) : 0,
          ibu: recipe.ibu ? Math.round(Number(recipe.ibu)) : 0,
          description: recipe.notes || '',
          srm: recipe.color ? Math.round(Number(recipe.color)) : 0,
          full_weight_grams: 64800,
          empty_weight_grams: 5000,
          capacity_liters: 58.67,
          is_active: true,
          device_id: 'keg-monitor-01',
          tower_number: selectedTap.tower,
          tap_position: selectedTap.position,
          hops: recipe.hops?.map(h => h.name).join(', ') || '',
        } as any)

      if (error) throw error

      if (onKegUpdate) {
        onKegUpdate(recipe._id, {
          beer_name: recipe.name,
          brewery: recipe.author,
          style: recipe.style?.name || 'Custom',
          abv: recipe.abv ? Number(recipe.abv) : 0,
          ibu: recipe.ibu ? Number(recipe.ibu) : 0,
        })
      }

      setShowRecipeSelector(false)
      setTimeout(() => setSelectedTap(null), 300)
    } catch (err: any) {
      console.error('Error creating keg from recipe:', err)
      console.error('Error details:', err.message, err.code, err.hint)
      alert(`Failed to add beer from recipe: ${err.message || 'Unknown error'}`)
    }
  }

  return (
    <>
      <div className={styles.tower}>
        <h2 className={styles.towerTitle}>Tower {towerNumber}</h2>

        <div className={styles.taps}>
          {taps.map((keg, idx) => (
            <Tap 
              key={idx} 
              position={idx + 1} 
              keg={keg} 
              onKegUpdate={onKegUpdate}
              onClick={() => handleTapClick(idx + 1)}
              isActive={selectedTap?.position === idx + 1}
            />
          ))}
        </div>
      </div>

      {showRecipeSelector && (
        <RecipeSelector onClose={handleCloseRecipeSelector} onSelectRecipe={handleSelectRecipe} />
      )}
    </>
  )
}

function Tap({ position, keg, onKegUpdate, onClick, isActive }: { position: number; keg: CurrentKegStatus | null; onKegUpdate?: (kegId: string, updates: Partial<CurrentKegStatus>) => void; onClick?: () => void; isActive?: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(keg?.beer_name || '')

  if (!keg) {
    return (
      <div className={`${styles.tap} ${isActive ? styles.tapSelected : ''}`} onClick={onClick}>
        <div className={styles.tapLabel}>Tap {position}</div>
        <div className={styles.empty}>
          <span>Empty</span>
          <span className={styles.addPrompt}>Click to add beer</span>
        </div>
      </div>
    )
  }

  const handleSaveName = async () => {
    if (editName.trim() === keg.beer_name) {
      setIsEditing(false)
      return
    }

    try {
      const { error } = await supabase
        .from('kegs')
        .update({ beer_name: editName.trim() })
        .eq('id', keg.id)

      if (error) throw error

      if (onKegUpdate) {
        onKegUpdate(keg.id, { beer_name: editName.trim() })
      }
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating beer name:', err)
      alert('Failed to update beer name')
    }
  }

  const handleCancel = () => {
    setEditName(keg.beer_name || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className={`${styles.tap} ${isActive ? styles.tapSelected : ''}`} onClick={onClick}>
      <div className={styles.tapLabel}>Tap {position}</div>

      <div className={styles.artwork}>
        {keg.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={keg.logo_url}
            alt={`${keg.beer_name ?? 'Beer'} logo`}
            className={styles.logo}
          />
        ) : (
          <BeerGlass srm={keg.srm} size={110} />
        )}
      </div>

      <div className={styles.beerNameContainer}>
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveName}
            autoFocus
            className={styles.beerNameInput}
            placeholder="Beer name"
          />
        ) : (
          <div className={styles.beerName}>{keg.beer_name || 'Unknown Beer'}</div>
        )}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={styles.editButton}
            title="Edit beer name"
          >
            ✏️
          </button>
        )}
      </div>
      {keg.brewery && <div className={styles.brewery}>{keg.brewery}</div>}
      {keg.style && <div className={styles.style}>{keg.style}</div>}

      <div className={styles.specs}>
        <div className={styles.spec}>
          <span className={styles.specLabel}>ABV</span>
          <span className={styles.specValue}>{formatAbv(keg.abv)}</span>
        </div>
        <div className={styles.spec}>
          <span className={styles.specLabel}>IBU</span>
          <span className={styles.specValue}>{formatIbu(keg.ibu)}</span>
        </div>
      </div>

    </div>
  )
}

function RecipeSelector({ onClose, onSelectRecipe }: { onClose: () => void; onSelectRecipe: (recipe: BrewfatherRecipe) => void }) {
  const [recipes, setRecipes] = useState<BrewfatherRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/brewfather/recipes')
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || `Request failed: ${response.status}`)
      }
      const data: BrewfatherRecipe[] = await response.json()
      setRecipes(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load recipes:', err)
      setError('Failed to load recipes from Brewfather')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRecipe = async (recipeId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/brewfather/recipes/${encodeURIComponent(recipeId)}`)
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || `Request failed: ${response.status}`)
      }
      const fullRecipe = await response.json()
      onSelectRecipe(fullRecipe)
    } catch (err) {
      console.error('Failed to load recipe details:', err)
      setError('Failed to load recipe details')
    } finally {
      setLoading(false)
    }
  }

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[‘’ʼ‛]/g, "'") // curly/modifier apostrophes → '
      .replace(/[“”]/g, '"')             // curly double quotes → "
      .replace(/\s+/g, ' ')
      .trim()

  const needle = normalize(searchTerm)
  const filteredRecipes = recipes.filter(recipe =>
    normalize(recipe.name ?? '').includes(needle) ||
    normalize(recipe.author ?? '').includes(needle)
  )

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Select a Recipe</h2>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={loadRecipes}>Retry</button>
          </div>
        )}

        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {loading && recipes.length === 0 ? (
          <div className={styles.loading}>Loading recipes...</div>
        ) : (
          <div className={styles.recipeList}>
            {filteredRecipes.length === 0 ? (
              <div className={styles.empty}>No recipes found</div>
            ) : (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className={styles.recipeItem}
                  onClick={() => handleSelectRecipe(recipe._id)}
                >
                  <div className={styles.recipeName}>{recipe.name}</div>
                  <div className={styles.recipeAuthor}>by {recipe.author}</div>
                  {recipe.style?.name && (
                    <div className={styles.recipeStyle}>{recipe.style.name}</div>
                  )}
                  {(recipe.abv || recipe.ibu) && (
                    <div className={styles.recipeSpecs}>
                      {recipe.abv && <span className={styles.recipeSpec}>{parseFloat(String(recipe.abv))}% ABV</span>}
                      {recipe.ibu && <span className={styles.recipeSpec}>{parseFloat(String(recipe.ibu))} IBU</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
