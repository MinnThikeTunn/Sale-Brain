const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Find the corrupted section
// Looking for: bestSellingCategory: "Food     const targetType
const corruptionStart = content.indexOf('bestSellingCategory: "Food     const targetType');
if (corruptionStart === -1) {
  console.log('Could not find corruption start');
  process.exit(1);
}

// Find the beginning of the line
const lineStart = content.lastIndexOf('\n', corruptionStart) + 1;
console.log('Corruption starts at character:', lineStart);

// Now find where the valid second FlashSale starts (after the corrupted code ends)
// Look for the second occurrence of "FlashSale:" in the valid code area
const firstFlashSale = content.indexOf('FlashSale:', lineStart);
const secondFlashSale = content.indexOf('FlashSale:', firstFlashSale + 10);
console.log('First FlashSale after corruption:', firstFlashSale);
console.log('Second FlashSale:', secondFlashSale);

// Find where valid code resumes after the corruption
// The corruption ends somewhere around line 1560 where we see "let promoPct"
const validCodeStart = content.indexOf('let promoPct = "15% OFF";', secondFlashSale);
console.log('Valid code starts at:', validCodeStart);

// Find where the second FlashSale entry ends (at its bannerPrompt)
const secondFlashBannerStart = content.lastIndexOf('bannerPrompt:', validCodeStart);
console.log('Second FlashSale banner at:', secondFlashBannerStart);

// Find the end of that line and the closing }
let secondFlashEnd = content.indexOf('"', secondFlashBannerStart + 20);
secondFlashEnd = content.indexOf('"', secondFlashEnd + 1);
secondFlashEnd = content.indexOf('}', secondFlashEnd + 1);
console.log('Second FlashSale ends around:', secondFlashEnd);

// Now let's extract the valid parts and rebuild
const beforeCorruption = content.substring(0, lineStart);
// This should end with: bestSellingCategory: "Food & Beverages"
// Let's find that
const beforeLastPart = beforeCorruption.lastIndexOf('bestSellingCategory:');
const afterBestSelling = content.indexOf('}', beforeLastPart);
console.log('\nFix point analysis:');
console.log('Last bestSellingCategory at:', beforeLastPart);
console.log('Ending } at:', afterBestSelling);

// We need to fix the first FlashSale to end properly
// Replace the corrupted first FlashSale with proper data
const cleanFirstFlashSale = `      FlashSale: {
        trendingProducts: ["Pathein Halawa (Premium)", "Artisanal Drinks"],
        underperformingProducts: ["Traditional Arts"],
        lowStockAlerts: ["Check stock limits weekly for weekend surges"],
        analyticsSummary: {
          salesGrowthEstimate: "Estimated +20% conversion improvement through routine weekend flash sales",
          engagementLevel: "Sustained high checkout spikes on payday weekends",
          bestSellingCategory: "Food & Beverages"
        },
        recommendations: [{
          campaignTitle: "Weekend Flash Sale ⚡",
          rationale: "Payday weekends see highest conversion rates. Target customers with ready cash after monthly pay.",
          targetAudience: "Working professionals and families with weekend shopping habits.",
          discountPercentage: "15-25% OFF",
          duration: "2-3 Days",
          expectedImpact: "25% sales boost during payday weekends with inventory clearing.",
          implementationSteps: [
            "Feature top 3 trending products at maximum discount.",
            "Post on Facebook/Instagram Friday evening.",
            "Offer KBZPay exclusive deals."
          ]
        }],
        copywriting: {
          facebookCaption: {
            en: "⚡ Flash Sale Weekend! Get 25% OFF on premium Burmese sweets and drinks. Limited time only -Shop now!",
            my: "⚡ ဝီကန့်ပရိုမိုးရှင်း! ရိုးရာမုန့်နှင့်အချိုရည်များကို ၂၅% လျှော့စျေး။ အချိန်ပါးပါးမှာ မှာယူလိုက်ပါ။"
          },
          instagramCaption: {
            en: "⚡ Weekend Flash Sale - 25% OFF Authentic Burmese Sweets! #FlashSale #BurmeseTreats",
            my: "⚡ ဝီကန့်ပရိုမိုးရှင်း ၂၅% လျှော့စျေး။ #ပရိုမိုးရှင်း #ရိုးရာမုန့်"
          },
          adCopy: {
            en: "Weekend Flash Sale - 25% OFF!",
            my: "ဝီကန့်ပရိုမိုးရှင်း ၂၅% လျှော့စျေး!"
          },
          email: {
            en: "Subject: Flash Sale This Weekend - 25% Off!",
            my: "ခေါင်းစဉ် - ဤပါဝါပရိုမိုးရှင်းမှာ ၂၅% လျှော့စျေး!"
          },
          hashtags: "#FlashSale #WeekendDeals #BurmeseSweets"
        },
        bannerPrompt: "A dynamic flash sale banner with lightning effects, showcasing premium traditional cake platters and drinks with textual overlay 'WEEKEND DELIGHT FLASH SALE'"
      }`;

// Now get the middle (between end of first FlashSale and start of valid code)
const validCodePortion = content.substring(secondFlashEnd + 1, validCodeStart);

// Now find what comes after the second flash sale in the fallbackTemplate
// Let's find the General campaign that comes after FlashSale
const generalStart = content.indexOf('General: {', secondFlashEnd);
console.log('General starts at:', generalStart);

// Find the end of General (find its closing })
let braceCount = 0;
let generalStartBrace = -1;
for (let i = generalStart; i < content.length; i++) {
  if (content[i] === '{') {
    if (braceCount === 0) generalStartBrace = i;
    braceCount++;
  }
  if (content[i] === '}' && braceCount > 0) {
    braceCount--;
    if (braceCount === 0) {
      generalEnd = i;
      break;
    }
  }
}
console.log('General ends at:', generalEnd);

// Now collect everything
// 1. content before corruption (up to lineStart)
// 2. clean first FlashSale
// 3. everything between first FlashSale end and General start 
// Wait - we need to get the structure right
// Actually, the fallbackTemplate should contain: Thingyan, Christmas, NewYear, Valentine, BackToSchool, MonsoonSale, FlashSale, General
// So we need to extract all the campaigns in order

// Let's find where Thingyan starts
const thingyanStart = content.indexOf('Thingyan: {');
const christmasStart = content.indexOf('Christmas: {');
const newYearStart = content.indexOf('NewYear: {');
const valentineStart = content.indexOf('Valentine: {');
const backToSchoolStart = content.indexOf('BackToSchool: {');
const monsoonStart = content.indexOf('MonsoonSale: {');
const flashSaleStart = content.indexOf('      FlashSale: {');
const generalCampaignStart = content.indexOf('      General: {');

console.log('\nCampaign positions:');
console.log('Thingyan:', thingyanStart);
console.log('Christmas:', christmasStart);
console.log('NewYear:', newYearStart);
console.log('Valentine:', valentineStart);
console.log('BackToSchool:', backToSchoolStart);
console.log('MonsoonSale:', monsoonStart);
console.log('FlashSale (first):', flashSaleStart);
console.log('General:', generalCampaignStart);

// The structure should be:
// fallbackTemplate = {
//   Thingyan: {...},
//   Christmas: {...},
//   NewYear: {...},
//   Valentine: {...},
//   BackToSchool: {...},
//   MonsoonSale: {...},
//   FlashSale: {...},
//   General: {...}
// }

// Let's extract each campaign's content and rebuild
function extractCampaign(startIdx, name) {
  let braceCount = 0;
  let startBrace = -1;
  let endBrace = -1;
  
  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') {
      if (braceCount === 0) startBrace = i;
      braceCount++;
    }
    if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endBrace = i;
        break;
      }
    }
  }
  return content.substring(startBrace, endBrace + 1);
}

const campaigns = {
  'Thingyan': extractCampaign(thingyanStart, 'Thingyan'),
  'Christmas': extractCampaign(christmasStart, 'Christmas'),
  'NewYear': extractCampaign(newYearStart, 'NewYear'),
  'Valentine': extractCampaign(valentineStart, 'Valentine'),
  'BackToSchool': extractCampaign(backToSchoolStart, 'BackToSchool'),
  'MonsoonSale': extractCampaign(monsoonStart, 'MonsoonSale'),
  'FlashSale': cleanFirstFlashSale,
  'General': extractCampaign(generalCampaignStart, 'General')
};

// Now we need to find where the fallbackTemplate is used and the rest of the code
// Find where "const fallbackTemplate: any = {" starts
const templateDefStart = content.indexOf('const fallbackTemplate: any = {');
// Find where the valid execution code starts (around "let promoPct")
const executionStart = content.indexOf('let promoPct = "15% OFF";');
// Find the end of the execution code block (around where the code returns fallbackResponse)
const executionEnd = content.indexOf('res.json({ success: true, strategy: fallbackResponse });');

console.log('\nExecution code:');
console.log('Starts at:', executionStart);
console.log('Ends at:', executionEnd);

// Collect everything before the template
const prefix = content.substring(0, templateDefStart);

// Build new file
let newContent = prefix + 'const fallbackTemplate: any = {\n';
for (const [name, data] of Object.entries(campaigns)) {
  newContent += `  ${name}: ${data},\n`;
}
newContent += '};\n\n';

// Add the execution code portion from the valid code
const executionCode = content.substring(executionStart, executionEnd + 60);
newContent += executionCode;

// Add everything after the execution code
const suffix = content.substring(executionEnd + 60);

newContent += suffix;

fs.writeFileSync('server.ts', newContent);
console.log('\nFile fixed! Written new server.ts');
console.log('New file length:', newContent.length);