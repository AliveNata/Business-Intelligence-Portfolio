function createExcelWithTwoTabs() {
  // Get the current date in Bangkok time (GMT+7)
  var timeZone = 'GMT+7';
  var now = new Date();
  // Add one hour to the current time
  now.setHours(now.getHours());

  var today = Utilities.formatDate(now, timeZone, 'yyyy-MM-dd HH:mm');

  // Create a new spreadsheet
  var newSpreadsheet = SpreadsheetApp.create("Lancome Order Data " + today);
  
  // Get the original spreadsheet
  var originalSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get the sheets you want to copy
  var sheet1 = originalSpreadsheet.getSheetByName("Order Data");
  var sheet2 = originalSpreadsheet.getSheetByName("Pivot Data");

  
  // Copy the data to the new spreadsheet
  sheet1.copyTo(newSpreadsheet).setName(sheet1.getName());
  sheet2.copyTo(newSpreadsheet).setName(sheet2.getName());
  
  // Remove the default empty sheet from the new spreadsheet
  newSpreadsheet.deleteSheet(newSpreadsheet.getSheets()[0]);
  
  // Get the spreadsheet ID of the new spreadsheet
  var newSpreadsheetId = newSpreadsheet.getId();
  
  // Create export URL for the new spreadsheet
  var url = 'https://docs.google.com/spreadsheets/d/' + newSpreadsheetId + '/export?format=xlsx';
  
  // Fetch the file as a blob
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  
  // Create the filename with today's date
  var filename1 = "TH - Lancome Order Data Report " + today + ".xlsx";
  var blob = response.getBlob().setName(filename1);


  // Send the email with the attachment and CC
  var emailAddress = ""; // Add your email addresses here
  var ccEmailAddress = ""; // Add your CC email addresses here
  var subject = "[Auto] Lancome Order Data Automation " + today;
  var body = `
Hi,

Hereby attached Lancome Order Data Automation as per your request.

If you find any issue, please contact your PIC directly.

Please do not reply this email.

Regards,
BI Team - Intrepid Asia
`;

  // Send the email
  MailApp.sendEmail({
    to: emailAddress,
    cc: ccEmailAddress, // Adding the CC field here
    subject: subject,
    body: body,
    attachments: [blob],  // Attach both files
    name: 'BI Report Automation'  // Set sender name
  });
}
