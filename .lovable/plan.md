

## Replace Generated Avatars with Real Brand Logos

The category items in `HeroCategoryItems.tsx` currently use `generateAvatar()` which produces letter-based SVG avatars. The user wants real brand photos/logos for each entity.

### Approach

Use real logo URLs from each brand's public presence (favicon/logo CDNs like `logo.clearbit.com` or direct brand URLs). This avoids needing to download and store 60+ images locally.

### Changes

**File: `src/components/HeroCategoryItems.tsx`**

Replace every `generateAvatar("...", "category")` call with a real logo URL for that brand. The mapping will cover all ~65 items across 18 categories:

- **Apps**: Nawy, Farida, Byit, Broker Zone -- real app logos
- **Shares**: Orascom, Talaat Moustafa, Palm Hills, SODIC -- company logos
- **Platforms**: Aqarmap, Dubizzle, Property Finder, Property Sorted
- **Brokers**: The Address, Bold Routes, RE/MAX, RED, Coldwell Banker, Nawy Partners
- **Exhibitions**: Cityscape, RED Expo, Al-Ahram Expo, The Real Estate
- **Channels**: Property Insider, Podcast Aqary, Bait Sameh
- **Law Firms**: Diyaa Eldin, Mashoralaw, Partners Law, ADSERO
- **Valuation**: JLL, CBRE, Savills
- **Training**: REIDIN Academy, MIM Academy, PropTech School
- **Auctions**: Auction House Egypt, Emirates Auction, Al Mal Auctions
- **Mortgage**: NBE, CIB, Arab Bank
- **Research**: JLL, Knight Frank, Cushman & Wakefield
- **Tax**: PwC, KPMG, EY
- **Management**: CBRE, Hill International, Emaar FM
- **Leasing**: Better Home, Allsopp & Allsopp, Cluttons
- **Blockchain**: Propy, RealToken, Brickblock
- **Lands**: NUCA, Nakheel, Aldar
- **Units**: These are generic property types (Studio, Villa, etc.) -- will use high-quality stock/icon images from free image sources

Logo source: `https://logo.clearbit.com/{domain}` for companies with known domains, and fallback to `generateAvatar()` for entities without a clear web domain.

For unit types (Studio, Villa, Penthouse, etc.), keep the generated avatars since these are property categories, not brands.

### Technical Details

- Single file edit: `src/components/HeroCategoryItems.tsx`
- Create a `brandLogos` mapping object at the top of the file for clean organization
- Replace each `generateAvatar(...)` call with the corresponding URL from the map
- Keep `generateAvatar` as import for any fallback cases

