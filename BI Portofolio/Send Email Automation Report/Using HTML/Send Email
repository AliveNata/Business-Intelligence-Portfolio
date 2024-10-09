function SendMTDEmail(){

const SendDailyEmail = ([hour])=>
  ScriptApp.newTrigger("MTDAchievementAutomatedEmail")
  .timeBased()
  .atHour(hour) 
  .everyDays(1) 
  .inTimezone("Asia/Jakarta")
  .create();

[[9]].forEach(SendDailyEmail)

}

function MTDAchievementAutomatedEmail(){

  try {

  var ss = SpreadsheetApp.getActive();
  var allsheets = ss.getSheets()

  var ss1 = SpreadsheetApp.getActive().getSheetByName("MTD_Email");
  var dataRange = ss1.getRange("A2")
  const intraday = dataRange.getDisplayValues();

  var ss2 = SpreadsheetApp.getActive().getSheetByName("MTD_Email");
  var dataRange2 = ss2.getRange("A3:D3")
  const headers = dataRange2.getDisplayValues();

  var reportsheet = "MTD_Email"
  var reportdate = ss.getSheetByName('Config_MTD').getRange('B2').getValue();
  var reportemailtime =Utilities.formatDate(reportdate, "Asia/Jakarta", "HH:mm:ss");
  var subjectemaildatetime =Utilities.formatDate(reportdate, "Asia/Jakarta", "yyyy-MM-dd");

  var subject = ss.getSheetByName('Config_MTD').getRange('B3').getValue() + ' @ ' + subjectemaildatetime;
  var recipient = ss.getSheetByName('Config_MTD').getRange('B4').getValue();
  var cc_email = ss.getSheetByName('Config_MTD').getRange('B5').getValue();
  var filename = ss.getSheetByName('Config_MTD').getRange('B6').getValue() + "_" + subjectemaildatetime;

  var ss3 = SpreadsheetApp.getActive().getSheetByName("count_row")
  var dataRange3 = ss3.getRange("B2").getValue();
  const tablerangeValue = ss2.getRange(4,1,dataRange3,4).getDisplayValues()

  const BrandName = headers[0][0]; 
  const MTDAchievement = headers[0][1];
  const RRMTDvsTarget = headers[0][2];
  const RRMTDvsLastMonth = headers[0][3];
  const Subject = subject;
  const ReportEmailTime = reportemailtime;
  

  const htmlTemplate = HtmlService.createTemplateFromFile('emailtablemtd');
  htmlTemplate.BrandName = BrandName;
  htmlTemplate.MTDAchievement = MTDAchievement;
  htmlTemplate.RRMTDvsTarget = RRMTDvsTarget;
  htmlTemplate.RRMTDvsLastMonth = RRMTDvsLastMonth;
  htmlTemplate.intraday = intraday;
  htmlTemplate.Subject = subject;
  htmlTemplate.reportEmailTime = reportemailtime;
  htmlTemplate.tablerangeValue = tablerangeValue;
  const htmlForEmail = htmlTemplate.evaluate().getContent();

  var cdataRange = ss2.getRange("A4")
  var cdata = cdataRange.getValues();

  var url = "https://docs.google.com/feeds/download/spreadsheets/Export?key=" + ss.getId() + "&exportFormat=xlsx"

  var params = {
    method : "get",
    headers : {"Authorization": "Bearer " + ScriptApp.getOAuthToken()},
    muteHttpExceptions: true
  };

  // Exclude unnecessary sheets (by hiding them)
  for (var i = 0; i < allsheets.length; i++) {
    if (allsheets[i].getSheetName() !== reportsheet) {
      allsheets[i].hideSheet()
    }
  }

  var blob = UrlFetchApp.fetch(url, params).getBlob();
  blob.setName(filename + ".xlsx");

  // Unhide sheets
  for (var i = 0; i < allsheets.length; i++) {
    allsheets[i].showSheet()
  }

  // Send email
  GmailApp.sendEmail(recipient,subject,'',{
    htmlBody:htmlForEmail,
    cc: cc_email,
    attachments:blob,
  },);

  // Update Last sent
  curdate = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss")
  ss.getSheetByName('Config_MTD').getRange('E1').setValue(curdate)

  } catch (f) {
  Logger.log(f.toString());
  }
}