# 🏷️ Thermal Label Printer - Environment Variables Guide

## 📋 Overview

This document explains all environment variables used in the Thermal Label Printer system.

## 🚀 Quick Setup

### For Local Development:
1. Copy .env.example to .env.local
2. Update the values as needed
3. Run: 
pm run dev

### For Render Deployment:
Add these variables in your Render dashboard under "Environment Variables"

---

## 🔑 Required Environment Variables

### **CLOUD_PRINTING**
- **Type:** Boolean (	rue or alse)
- **Default:** alse
- **Description:** Enable cloud printing via PrintNode or use local TCP connection
- **Local:** alse (use local printer)
- **Production:** 	rue (use PrintNode cloud printing)

### **COMPANY_AUTH_TOKEN**
- **Type:** String
- **Default:** 	hermal-internal-2024
- **Description:** Authentication token for API access. Users must include this in request headers.
- **Security:** Change this to a unique, secure token for production
- **Usage:** Include in API requests as x-company-token header

### **NODE_ENV**
- **Type:** String
- **Values:** development, production, 	est
- **Default:** development
- **Description:** Node environment mode
- **Auto-set:** Render automatically sets this to production

---

## ☁️ Cloud Printing Variables (PrintNode)

### **PRINTNODE_API_KEY**
- **Type:** String
- **Required:** Only when CLOUD_PRINTING=true
- **Description:** Your PrintNode API key
- **Get it:** https://app.printnode.com/account/apikey
- **Example:** bc123xyz789def456ghi012jkl345

### **CLOUD_PRINTER_ID**
- **Type:** String
- **Required:** Only when CLOUD_PRINTING=true
- **Description:** PrintNode printer ID
- **Find it:** PrintNode dashboard → Printers → Copy ID
- **Example:** 12345678

**How to get PrintNode credentials:**
1. Sign up at https://printnode.com
2. Install PrintNode client on computer with thermal printer
3. Get API key from Account → API Keys
4. Get Printer ID from Printers dashboard

---

## 🖨️ Local Printer Variables

### **PRINTER_IP**
- **Type:** String (IP address)
- **Default:** 192.168.1.87
- **Description:** IP address of your local thermal printer
- **Used when:** CLOUD_PRINTING=false
- **Find it:** Print network config page from printer

### **PRINTER_PORT**
- **Type:** Number
- **Default:** 9100
- **Description:** Network port for thermal printer
- **Standard:** Most thermal printers use port 9100

---

## 🤖 Optional: AI Integration Variables

### **OPENAI_API_KEY**
- **Type:** String
- **Required:** No (optional feature)
- **Description:** OpenAI API key for chat toxicity detection
- **Get it:** https://platform.openai.com/api-keys
- **Usage:** Enables AI-powered content moderation

### **PERSPECTIVE_API_KEY**
- **Type:** String
- **Required:** No (optional feature)
- **Description:** Google Perspective API key for toxicity detection
- **Get it:** https://perspectiveapi.com
- **Usage:** Additional content moderation layer

---

## 📊 Optional: Sentry Integration Variables

### **SENTRY_AUTH_TOKEN**
- **Type:** String
- **Required:** No (optional feature)
- **Description:** Sentry authentication token
- **Get it:** Sentry Settings → Auth Tokens

### **SENTRY_ORG**
- **Type:** String
- **Required:** No (optional feature)
- **Description:** Your Sentry organization slug

### **SENTRY_PROJECT**
- **Type:** String
- **Required:** No (optional feature)
- **Description:** Your Sentry project name

---

## 🔧 Configuration Examples

### Local Development (.env.local)
\\\env
CLOUD_PRINTING=false
COMPANY_AUTH_TOKEN=thermal-internal-2024
NODE_ENV=development
PRINTER_IP=192.168.1.87
PRINTER_PORT=9100
\\\

### Render Production Deployment
\\\env
CLOUD_PRINTING=true
COMPANY_AUTH_TOKEN=your-secure-token-here-change-this
NODE_ENV=production
PRINTNODE_API_KEY=your-printnode-api-key
CLOUD_PRINTER_ID=your-printer-id
\\\

---

## 🔒 Security Best Practices

1. **Never commit .env.local** to git (already in .gitignore)
2. **Change default tokens** in production
3. **Use strong authentication tokens** (random, long strings)
4. **Rotate API keys** regularly
5. **Limit API key permissions** to minimum required

---

## 🐛 Troubleshooting

### Local Printer Not Working?
- Check PRINTER_IP is correct
- Verify printer is on same network
- Confirm PRINTER_PORT is 9100
- Ensure CLOUD_PRINTING=false

### Cloud Printing Not Working?
- Verify PRINTNODE_API_KEY is valid
- Check CLOUD_PRINTER_ID is correct
- Ensure PrintNode client is running
- Confirm CLOUD_PRINTING=true

### Authentication Errors?
- Verify COMPANY_AUTH_TOKEN matches in client
- Check header name is x-company-token
- Ensure token has no extra spaces

---

## 📞 Support

For issues with:
- **PrintNode:** https://printnode.com/support
- **Environment setup:** Check this README
- **API issues:** Review API documentation

---

## 🎯 Next Steps

1. **Setup environment variables** as described above
2. **Test locally** with 
pm run dev
3. **Deploy to Render** with production variables
4. **Update HTML client** with your Render URL
5. **Distribute to users** and start printing!

