# Keg Dashboard

Real-time beer keg monitoring system built with Next.js 16, TypeScript, SCSS Modules, and Supabase.

## Features

✅ **Real-time Keg Monitoring**
- Live weight updates every 5 seconds
- Automatic status indicators (Full/OK/Low/Empty)
- Liters and pints remaining calculations

✅ **Detailed Beer Information**
- Beer name, brewery, style
- ABV (Alcohol by Volume)
- IBU (International Bitterness Units)
- SRM color indicator with visual swatch
- Beer description/tasting notes

✅ **Mobile-First Design**
- Responsive grid layout
- Touch-friendly interface
- SCSS modules with mobile-first breakpoints

✅ **Real-Time Updates**
- Supabase Realtime subscriptions
- Auto-refresh fallback
- Live status updates

## Prerequisites

1. **Supabase Project** with keg-scale schema
2. **ESP32** sending weight data
3. **Node.js** 18+ installed

## Setup

### 1. Install Dependencies

```bash
cd /Users/ecrawshaw/Projects/keg-dashboard
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
cp .env.local.template .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://huhojweqdkeafaoosriq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key-here
```

### 3. Update Supabase Schema

Run the SQL migration to add beer details fields:

```bash
# In Supabase SQL Editor, run:
cat ../esp32-load-cell/add-beer-details-schema.sql
```

Or manually add:

```sql
ALTER TABLE kegs
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS srm INTEGER;
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
keg-dashboard/
├── app/
│   ├── page.tsx              # Dashboard home
│   ├── page.module.scss      # Dashboard styles
│   ├── layout.tsx            # Root layout
│   ├── globals.scss          # Global styles
│   ├── manage/               # Keg management (TODO)
│   └── analytics/            # Charts & analytics (TODO)
├── components/
│   ├── KegCard/
│   │   ├── KegCard.tsx       # Keg display component
│   │   └── KegCard.module.scss
│   ├── KegGauge/             # (TODO)
│   └── ConsumptionChart/     # (TODO)
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── types.ts              # TypeScript types
│   └── database.types.ts     # Generated DB types
└── styles/
    └── _variables.scss       # SCSS variables & mixins
```

## Current Status

### ✅ Completed
- [x] Next.js 16 project setup
- [x] SCSS modules architecture
- [x] Supabase client integration
- [x] Real-time subscriptions
- [x] KegCard component with full beer details
- [x] Dashboard page with auto-refresh
- [x] Mobile-responsive layout

### 🚧 TODO
- [ ] Keg management interface (add/edit/calibrate)
- [ ] Analytics/charts page
- [ ] Calibration wizard component
- [ ] Consumption graphs

## Database Schema

### Kegs Table

| Field | Type | Description |
|-------|------|-------------|
| `beer_name` | TEXT | Beer name |
| `brewery` | TEXT | Brewery name |
| `style` | TEXT | Beer style (IPA, Lager, etc.) |
| `abv` | REAL | Alcohol by volume % |
| `ibu` | INTEGER | International Bitterness Units |
| `description` | TEXT | **NEW** - Tasting notes |
| `srm` | INTEGER | **NEW** - Standard Reference Method (color) |

See `../esp32-load-cell/keg-scale-schema.sql` for full schema.

## API Routes

### Current Status View

```typescript
// Fetch all active kegs
const { data } = await supabase
  .from('current_keg_status')
  .select('*')
  .order('name')
```

Returns:
- Current weight and fill percentage
- Liters/pints remaining
- Status (full/ok/low/empty)
- All beer details (ABV, IBU, SRM, description)

## Development

### Update Beer Info

In Supabase SQL Editor:

```sql
UPDATE kegs
SET
  beer_name = 'Hazy IPA',
  brewery = 'Local Brewery',
  style = 'New England IPA',
  abv = 6.5,
  ibu = 45,
  srm = 6,
  description = 'Juicy and hop-forward with notes of citrus and tropical fruit'
WHERE id = 'your-keg-uuid';
```

### SRM Color Reference

- 2-4: Pale lager (light yellow)
- 5-8: Golden/amber ale (amber)
- 10-17: Amber/copper (deep amber)
- 20-35: Brown (brown)
- 40+: Stout/porter (black)

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Environment Variables

Add to Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### No kegs showing

1. Check Supabase connection:
```sql
SELECT * FROM current_keg_status;
```

2. Verify environment variables in `.env.local`

3. Check browser console for errors

### Real-time not working

1. Verify Supabase Realtime is enabled
2. Check kegs have `is_active = true`
3. Ensure ESP32 is sending data

### Styles not loading

1. Check SCSS files compile:
```bash
npm run dev
```

2. Verify imports in components

## Next Steps

1. **Add Keg Management**
   - Create/edit keg form
   - Calibration wizard
   - Delete/archive kegs

2. **Build Analytics**
   - Consumption charts (Recharts)
   - Pour tracking
   - Trends over time

3. **Mobile Optimization**
   - PWA support
   - Touch gestures
   - Offline mode

## License

MIT
