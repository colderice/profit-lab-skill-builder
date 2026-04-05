/**
 * Merged Google Apps Script Webhook
 * 
 * Handles both:
 * 1. Audit Leads (Default 'Leads' tab)
 * 2. Skill Builder Leads ('GPT-Convert tab')
 */

function doPost(e) {
  try {
    // 1. Get the data from the incoming request payload
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 2. Determine which tab to use
    var tabName = data.tab_name || "Leads";
    var sheet = ss.getSheetByName(tabName);
    
    // Create the tab if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      if (tabName === "GPT-Convert tab") {
        sheet.appendRow(["First Name", "Email"]);
        sheet.getRange(1, 1, 1, 2).setFontWeight("bold");
      } else {
        sheet.appendRow(["Date", "First Name", "Email", "Business Name", "Industry", "Website URL", "Score", "Grade", "Report URL", "Facebook", "Instagram", "Twitter", "Linkedin", "Youtube", "Tiktok"]);
        sheet.getRange(1, 1, 1, 15).setFontWeight("bold");
      }
    }

    // 3. Routing Logic
    if (tabName === "GPT-Convert tab") {
      // Logic for the NEW Skill Builder tab (2 columns only)
      sheet.appendRow([
        data.firstName || data.first_name, // Support both formats
        data.email
      ]);
    } else {
      // ORIGINAL logic for the "Leads" tab (Audit App)
      sheet.appendRow([
        data.date || new Date().toLocaleString(),
        data.firstName || data.first_name,
        data.email,
        data.businessName || "",
        data.industry || "",
        data.websiteUrl || "",
        data.score || "",
        data.grade || "",
        data.reportUrl || "",
        data.facebook || "",
        data.instagram || "",
        data.twitter || "",
        data.linkedin || "",
        data.youtube || "",
        data.tiktok || ""
      ]);
    }
    
    // 4. Return success response
    return ContentService.createTextOutput(JSON.stringify({"result": "success", "tab": tabName}))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": err.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
