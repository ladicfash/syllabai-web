export async function exportUserDataAsCSV() {
  try {
    // Create a basic CSV export with user data
    const csvContent = generateCSV({
      user: { name: "User", email: "", createdAt: new Date().toISOString() },
      notes: [],
      flashcards: [],
      studyHistory: [],
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `syllabai-data-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Data export failed:", error);
    throw error;
  }
}

function generateCSV(userData: any): string {
  const rows: string[] = [];

  // User Profile Section
  rows.push("=== USER PROFILE ===");
  rows.push("Field,Value");
  if (userData.user) {
    rows.push(`Name,"${userData.user.name || ""}"`);
    rows.push(`Email,"${userData.user.email || ""}"`);
    rows.push(`Created,"${userData.user.createdAt || ""}"`);
  }

  rows.push("");
  rows.push("=== NOTES ===");
  rows.push("ID,Title,Folder,Format,Created,Updated,Preview");
  if (userData.notes && Array.isArray(userData.notes)) {
    userData.notes.forEach((note: any) => {
      rows.push(
        `"${note.id}","${escapeCSV(note.title)}","${note.folder || ""}","${note.format || "markdown"}","${note.createdAt}","${note.updatedAt}","${escapeCSV(note.preview || "")}"`
      );
    });
  }

  rows.push("");
  rows.push("=== FLASHCARDS ===");
  rows.push("ID,Front,Back,Deck,Difficulty,Created");
  if (userData.flashcards && Array.isArray(userData.flashcards)) {
    userData.flashcards.forEach((card: any) => {
      rows.push(
        `"${card.id}","${escapeCSV(card.front)}","${escapeCSV(card.back)}","${card.deck || ""}","${card.difficulty || "medium"}","${card.createdAt}"`
      );
    });
  }

  rows.push("");
  rows.push("=== STUDY HISTORY ===");
  rows.push("ID,Type,Topic,Duration (min),Score,Date");
  if (userData.studyHistory && Array.isArray(userData.studyHistory)) {
    userData.studyHistory.forEach((entry: any) => {
      rows.push(
        `"${entry.id}","${entry.type}","${escapeCSV(entry.topic)}","${entry.duration || 0}","${entry.score || ""}","${entry.createdAt}"`
      );
    });
  }

  rows.push("");
  rows.push("Export Date: " + new Date().toISOString());

  return rows.join("\n");
}

function escapeCSV(value: string): string {
  if (!value) return "";
  return value.replace(/"/g, '""');
}
