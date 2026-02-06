/**
 * Aha! Project - Google Sheets Backend
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code into Code.gs.
 * 4. Run the 'setup' function once to create the header row.
 * 5. Deploy as Web App:
 *    - Click "Deploy" > "New deployment".
 *    - Select type "Web app".
 *    - Set "Who has access" to "Anyone".
 *    - Copy the Web App URL.
 */

function setup() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Headers updated to include School
    const headers = ["Timestamp", "Student ID", "Name", "School", "Question", "Answer (Optional)", "Likes", "Comments Count"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
}

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Parse data: Handle both JSON content type and text/plain (CORS workaround)
        let data;
        try {
            data = JSON.parse(e.postData.contents);
        } catch (parseError) {
            // Fallback: If parsing fails (or if sent as raw text), try parsing again
            // Sometimes e.postData.contents is already an object if the header was set correctly by some clients,
            // but usually with text/plain it's a string.
            data = e.parameter; // Check if sent as form data fallback
        }

        // Safety check
        if (!data || !data.question) {
            // If JSON.parse failed on the string content
            // This line is a fallback for cases where e.postData.contents might be a string that *should* be JSON,
            // but the initial parse failed, or if e.parameter was empty.
            // If e.postData.contents is truly plain text, this will throw an error, which will be caught by the outer try/catch.
            data = JSON.parse(e.postData.contents);
        }

        const timestamp = new Date();

        // Append row: [Timestamp, Student ID, Name, School, Question, Answer, 0, 0]
        sheet.appendRow([
            timestamp,
            data.studentId,
            data.name,
            data.school || "", // Add School field
            data.question,
            data.answer || "",
            0, // Initial likes
            0  // Initial comments count
        ]);

        return ContentService.createTextOutput(JSON.stringify({
            "result": "success",
            "row": sheet.getLastRow()
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({
            "result": "error",
            "error": e.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function doGet(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift(); // Remove header row

    // Convert to JSON array
    const questions = rows.map((row, index) => {
        return {
            id: index + 2, // Use row number as ID (simplest approach)
            timestamp: row[0],
            studentId: row[1],
            userDisplayName: row[2], // Name
            school: row[3],          // School
            content: row[4],         // Question (shifted by 1)
            answer: row[5],          // Answer (shifted by 1)
            likes: parseInt(row[6]) || 0,
            commentsCount: parseInt(row[7]) || 0,
            // Create a deterministic avatar based on name
            userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row[2])}`
        };
    }).reverse(); // Show newest first

    return ContentService.createTextOutput(JSON.stringify(questions))
        .setMimeType(ContentService.MimeType.JSON);
}
