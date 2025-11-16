# PRE-DEPLOYMENT CHECKLIST
## Filter Display Formatting Changes

**Before pushing to GitHub (auto-deploys to Vercel)**

---

## 🎯 CURRENT STATUS

- ✅ Changes implemented locally
- ✅ Unit tests passing (55/55)
- ✅ Backup created (commit 023fef4)
- ✅ Rollback procedure documented
- 🔄 **Manual testing in progress**
- ⏸️ **NOT yet deployed to Vercel**

---

## ✅ MANDATORY PRE-DEPLOYMENT TESTS

### **1. Homepage Load Test**
- [ ] Visit http://localhost:3000
- [ ] Page loads without errors
- [ ] No console errors (check F12)
- [ ] All UI elements visible

### **2. Filter Display Test**

**Seniority Dropdown:**
- [ ] Opens correctly
- [ ] Shows Title Case values ("Junior", "Mid-Level", "Senior")
- [ ] **NOT** showing lowercase ("junior", "mid-level", "senior")
- [ ] No duplicate values

**Location Dropdown:**
- [ ] Opens correctly
- [ ] Shows formatted values ("San Francisco Bay Area", "New York City")
- [ ] **NOT** showing lowercase or invalid values ("null", "n/a")
- [ ] No duplicate values

**Work Type Dropdown:**
- [ ] Opens correctly
- [ ] Shows **EXACTLY 3 options:** "Remote", "Hybrid", "In-Person"
- [ ] **NOT** showing variations ("remote_us", "hybrid_only", "onsite")
- [ ] No other options present

### **3. Filter Functionality Test**

**Work Arrangement:**
- [ ] Select "Remote" → Returns remote jobs
- [ ] Select "Hybrid" → Returns hybrid jobs
- [ ] Select "In-Person" → Returns onsite jobs
- [ ] Results are accurate (check job descriptions confirm work type)

**Seniority:**
- [ ] Select "Junior" → Returns junior-level jobs
- [ ] Select "Senior" → Returns senior-level jobs
- [ ] Select "Principal" → Returns principal-level jobs
- [ ] Results are accurate

**Location:**
- [ ] Select "San Francisco Bay Area" → Returns SF jobs
- [ ] Select "New York City" → Returns NYC jobs
- [ ] Select "Remote" → Returns remote jobs
- [ ] Results are accurate

**Multiple Filters:**
- [ ] Select "Remote" + "Senior" → Returns senior remote jobs
- [ ] Select "Hybrid" + "Mid-Level" → Returns mid-level hybrid jobs
- [ ] Results respect ALL selected filters (AND logic)

### **4. Search Test**

- [ ] Search for "Product Manager" → Returns relevant results
- [ ] Search + Filter (e.g., "Product Manager" + "Remote") → Works
- [ ] Search highlighting works (yellow highlights)
- [ ] Clear search works

### **5. Advanced Filters Test**

- [ ] Click "Advanced Filters" button → Sidebar opens
- [ ] Company Stage filter works
- [ ] Product Domain filter works
- [ ] Management Scope filter works
- [ ] Industry Vertical filter works
- [ ] Experience Bucket filter works
- [ ] Salary filter works
- [ ] Tag filters work
- [ ] Clear advanced filters works
- [ ] Sidebar closes correctly

### **6. Pagination Test**

- [ ] "Load More Jobs" button appears
- [ ] Click "Load More" → Loads next batch
- [ ] Job count increases correctly
- [ ] Can load up to 1000 jobs
- [ ] "All jobs loaded" message appears when done

### **7. Job Detail Test**

- [ ] Click on a job title → Detail page loads
- [ ] Job details display correctly
- [ ] Tags display in Title Case
- [ ] Company sidebar displays correctly
- [ ] "Apply Now" button works
- [ ] "Back to Jobs" link works

### **8. Tag Display Test**

**Job Cards:**
- [ ] Tags display in Title Case ("Product Strategy", not "product strategy")
- [ ] Special terms formatted correctly ("API", "B2B SaaS", "UI/UX")
- [ ] Tag colors are correct

**Job Detail Page:**
- [ ] Responsibilities tags display correctly (blue)
- [ ] Tools & Platforms tags display correctly (green)
- [ ] Technical Skills tags display correctly (purple)
- [ ] All tags in Title Case

### **9. URL State Test**

- [ ] Apply filters → URL updates with filter params
- [ ] Copy URL → Paste in new tab → Filters are applied
- [ ] Browser back/forward buttons work
- [ ] Shareable filter URLs work

### **10. Console Check**

- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] Console logs show formatted values:
  ```
  🔍 Actual database values:
    Seniority: [Title Case values]
    Location: [Formatted values]
    Work Arrangement: [Remote, Hybrid, In-Person]
  ```

---

## 🔬 BROWSER TESTING

Test in multiple browsers (if possible):

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browser

---

## 📊 EXPECTED VS ACTUAL COMPARISON

### **Seniority Levels**

**EXPECTED (Title Case):**
```
Entry Level, Junior, Mid-Level, Senior, Staff, Principal,
Director, VP, C-Level
```

**ACTUAL (from console logs):**
```
[Paste actual values from console here after testing]
```

**Status:** ✅ Match / ❌ Don't Match

---

### **Locations**

**EXPECTED (Formatted, No Invalid):**
```
San Francisco Bay Area, New York City, Seattle, Austin,
Boston, Remote, London, Berlin
(No "null", "n/a", lowercase values)
```

**ACTUAL (from console logs):**
```
[Paste actual values from console here after testing]
```

**Status:** ✅ Match / ❌ Don't Match

---

### **Work Arrangement**

**EXPECTED (EXACTLY 3):**
```
Remote, Hybrid, In-Person
```

**ACTUAL (from console logs):**
```
[Paste actual values from console here after testing]
```

**Status:** ✅ Match (3 options) / ❌ Don't Match (more or less than 3)

---

## 🐛 ISSUES FOUND

**Document any issues found during testing:**

| Issue | Severity | Description | Status |
|-------|----------|-------------|--------|
| 1.    | High/Medium/Low | [Description] | Fixed/Open |
| 2.    | High/Medium/Low | [Description] | Fixed/Open |

---

## ⚠️ DEPLOYMENT DECISION

### **All Tests Pass?**

**YES** ✅
- [ ] All mandatory tests completed
- [ ] All tests passing
- [ ] No critical issues found
- [ ] Expected vs Actual values match
- [ ] Ready to deploy

**Action:** Proceed to deployment
```bash
git add -A
git commit -m "chore: mark pre-deployment checklist complete"
git push -u origin claude/understand-app-functionality-01WYS5peBSAwf1fZ18n2Ce3A
```

---

**NO** ❌
- [ ] Tests failing
- [ ] Critical issues found
- [ ] Expected vs Actual don't match
- [ ] Not ready to deploy

**Action:** Fix issues first
1. Document issues above
2. Fix the problems
3. Re-run all tests
4. Do NOT push to remote yet

---

## 🚀 DEPLOYMENT PROCEDURE

**When all tests pass:**

### **Step 1: Final Commit**
```bash
# Add any remaining changes
git add -A

# Commit with deployment note
git commit -m "ready: filter display formatting verified and ready for production"
```

### **Step 2: Review Changes**
```bash
# Review all changes one more time
git diff 023fef4..HEAD

# Review files changed
git diff --stat 023fef4..HEAD
```

### **Step 3: Push to Remote (Triggers Vercel Deployment)**
```bash
# This will trigger automatic deployment to Vercel
git push -u origin claude/understand-app-functionality-01WYS5peBSAwf1fZ18n2Ce3A
```

### **Step 4: Monitor Vercel Deployment**
1. Watch Vercel dashboard for deployment status
2. Wait for deployment to complete
3. Check build logs for errors

### **Step 5: Production Verification**
1. Visit https://product-careers.com
2. Test critical functionality:
   - Homepage loads
   - Filters work
   - Search works
   - No console errors
3. Verify filters display correctly
4. Test filter functionality

### **Step 6: Post-Deployment Monitoring**
- Monitor for 1 hour after deployment
- Check for user reports
- Check analytics for errors
- Be ready to rollback if needed

---

## 🛟 IF DEPLOYMENT FAILS

**Immediate Action:**
1. Check Vercel deployment logs
2. Check production site for errors
3. If critical: **ROLLBACK IMMEDIATELY**

**Rollback Command:**
```bash
git reset --hard 023fef4
git push -f origin claude/understand-app-functionality-01WYS5peBSAwf1fZ18n2Ce3A
```

**See ROLLBACK_PROCEDURE.md for detailed instructions**

---

## 📝 TESTING LOG

**Tester:** [Your Name]
**Date:** [Date]
**Time Started:** [Time]
**Time Completed:** [Time]

### **Test Results:**

```
Homepage Load: PASS / FAIL
Filter Display: PASS / FAIL
Filter Functionality: PASS / FAIL
Search: PASS / FAIL
Advanced Filters: PASS / FAIL
Pagination: PASS / FAIL
Job Detail: PASS / FAIL
Tag Display: PASS / FAIL
URL State: PASS / FAIL
Console Check: PASS / FAIL
```

**Overall Result:** PASS / FAIL

**Notes:**
```
[Any additional notes or observations]
```

---

## ✅ FINAL CHECKLIST BEFORE PUSH

- [ ] All mandatory tests completed
- [ ] All tests passing
- [ ] No console errors
- [ ] Filters display correctly (Title Case, formatted, 3 work options)
- [ ] Filtering works accurately
- [ ] Search works
- [ ] No breaking changes
- [ ] Expected vs Actual values match
- [ ] Backup created and documented
- [ ] Rollback procedure understood
- [ ] Ready to monitor post-deployment

**If ALL boxes checked:** ✅ **SAFE TO DEPLOY**

**Signature:** _____________________ **Date:** _____________________

---

**Current Status:** ⏸️ **AWAITING MANUAL TESTING**

**Dev Server:** http://localhost:3000 (running)

**Next Action:** Complete manual testing using this checklist
