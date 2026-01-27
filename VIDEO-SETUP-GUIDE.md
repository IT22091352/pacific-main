# Hero Video Background - Setup Instructions

## 📹 Video Background Feature

The Ceylon Sang homepage now includes an **autoplay video background** in the hero section to showcase the beauty of Sri Lanka.

## 🎬 How to Add Your Video

### Step 1: Get a Sri Lanka Tourism Video

You have several options:

#### Option A: Download from Free Stock Video Sites
1. **Pexels** (https://www.pexels.com/search/videos/sri%20lanka/)
   - Search for "Sri Lanka tourism" or "Sri Lanka beach"
   - Download high-quality MP4 videos (1080p recommended)
   - Free for commercial use

2. **Pixabay** (https://pixabay.com/videos/search/sri%20lanka/)
   - Search for "Sri Lanka" or "tropical beach"
   - Download MP4 format
   - No attribution required

3. **Videvo** (https://www.videvo.net/)
   - Search for "Sri Lanka" or "tropical paradise"
   - Free HD videos available

#### Option B: Use Your Own Footage
- Record your own Sri Lanka tourism footage
- Recommended: Sigiriya, beaches, tea plantations, wildlife

### Step 2: Prepare the Video

**Video Specifications:**
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Duration**: 10-30 seconds (loops automatically)
- **File Size**: Keep under 5MB for fast loading
- **Aspect Ratio**: 16:9 (landscape)

**Optimize Your Video:**

1. **Using Online Tools:**
   - **CloudConvert** (https://cloudconvert.com/mp4-converter)
     - Upload your video
     - Set quality to 720p or 1080p
     - Compress to reduce file size
   
   - **Online-Convert** (https://www.online-convert.com/)
     - Convert and compress to MP4
     - Adjust bitrate for smaller size

2. **Using Software:**
   - **HandBrake** (Free, Windows/Mac/Linux)
     - Open video → Select "Fast 720p30" preset
     - Adjust quality slider to reduce file size
   
   - **VLC Media Player**
     - Media → Convert/Save
     - Choose MP4 format with H.264 codec

### Step 3: Add Video to Your Website

1. **Rename your video file:**
   ```
   sri-lanka-hero.mp4
   ```

2. **Place the video in the images folder:**
   ```
   c:\Users\ASUS\Downloads\pacific-main\pacific-main\images\sri-lanka-hero.mp4
   ```

3. **That's it!** The video will automatically play on page load.

## 🎨 Video Content Suggestions

**Best Sri Lanka Tourism Scenes:**
- 🏖️ Pristine beaches (Mirissa, Unawatuna)
- 🏔️ Sigiriya Rock Fortress
- 🌿 Tea plantations in Nuwara Eliya
- 🐘 Elephants in Yala National Park
- 🚂 Scenic train journey through hill country
- 🏰 Galle Fort colonial architecture
- 🌅 Sunset over the Indian Ocean
- 🎭 Traditional cultural performances

## ⚙️ Technical Features

### Autoplay Settings
The video is configured to:
- ✅ Autoplay on page load
- ✅ Loop continuously
- ✅ Muted (required for autoplay)
- ✅ Play inline on mobile devices
- ✅ Fallback to image on mobile for performance

### Mobile Optimization
- On mobile devices (< 768px), the video is **hidden**
- A static background image is shown instead
- This improves mobile performance and saves data

### Browser Compatibility
- ✅ Chrome, Firefox, Safari, Edge (all modern browsers)
- ✅ iOS Safari (with playsinline attribute)
- ✅ Android Chrome
- ✅ Fallback image for older browsers

## 🔧 Customization Options

### Change Video Source
Edit `index.html` line 60:
```html
<source src="images/your-video-name.mp4" type="video/mp4">
```

### Adjust Video Overlay Darkness
Edit `css/ceylon-sang.css` - modify overlay opacity:
```css
.hero-wrap .overlay {
    opacity: 0.5; /* Adjust between 0.3 (lighter) to 0.7 (darker) */
}
```

### Enable Video on Mobile
Edit `css/ceylon-sang.css` - remove or comment out:
```css
/* @media (max-width: 768px) {
    .hero-video {
        display: none;
    }
} */
```
⚠️ Warning: This may slow down mobile performance

### Add Multiple Videos (Slideshow)
You can add multiple `<source>` tags for different formats:
```html
<video autoplay muted loop playsinline id="hero-video" class="hero-video">
    <source src="images/sri-lanka-hero.webm" type="video/webm">
    <source src="images/sri-lanka-hero.mp4" type="video/mp4">
</video>
```

## 📊 Performance Tips

1. **Compress Your Video:**
   - Target: 2-5MB file size
   - Use H.264 codec with medium quality
   - 720p is sufficient for web

2. **Lazy Load (Optional):**
   - Video loads immediately for best UX
   - Consider lazy loading for slower connections

3. **Preload Attribute:**
   - Current: Auto (loads automatically)
   - Alternative: `preload="metadata"` (loads only metadata)

## 🎯 Recommended Free Videos

Here are some direct searches to find perfect Sri Lanka videos:

1. **Pexels:**
   - "Sri Lanka beach sunset"
   - "Sri Lanka tea plantation"
   - "Tropical paradise aerial"

2. **Pixabay:**
   - "Sri Lanka tourism"
   - "Tropical beach waves"
   - "Asian temple"

3. **Coverr:**
   - "Beach waves"
   - "Tropical nature"
   - "Ocean sunset"

## ✅ Current Setup

**Video File Location:**
```
images/sri-lanka-hero.mp4
```

**Fallback Image:**
```
images/bg_1.jpg
```

**Status:**
- ✅ HTML structure ready
- ✅ CSS styling complete
- ✅ Mobile optimization enabled
- ⏳ **Waiting for video file to be added**

## 🚀 Quick Start

1. Download a Sri Lanka tourism video from Pexels
2. Rename it to `sri-lanka-hero.mp4`
3. Place it in the `images` folder
4. Refresh your website - done!

---

**Note:** Until you add the video file, the website will show the fallback background image (`bg_1.jpg`), so the site will still look great!
