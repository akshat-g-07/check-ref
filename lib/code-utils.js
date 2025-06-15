export function CodeGenerator(selectedPlatform, selectedOption) {
  const code = [];

  switch (selectedPlatform) {
    case "Twitter":
      code.push("T");
      break;
    case "Reddit":
      code.push("R");
      break;
    case "Facebook":
      code.push("F");
      break;
    case "Telegram":
      code.push("M");
      break;
    case "Whatsapp":
      code.push("W");
      break;
    case "Youtube":
      code.push("Y");
      break;
    case "Other":
      code.push("O");
      break;
  }

  switch (selectedOption) {
    case "Post":
      code.push("po");
      break;
    case "Comment":
      code.push("co");
      break;
    case "DM":
      code.push("dm");
      break;
    case "Community":
      code.push("cy");
      break;
    case "Group":
      code.push("gp");
      break;
    case "Status":
      code.push("ss");
      break;
    case "Subreddit":
      code.push("sr");
      break;
    case "Description":
      code.push("dn");
      break;
    case "Other":
      code.push("oo");
      break;
  }

  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear().toString();

  const formattedDate = `${day}${month}${year}`;

  formattedDate.split("").forEach((digit) => {
    switch (digit) {
      case "0":
        code.push("a");
        break;
      case "1":
        code.push("b");
        break;
      case "2":
        code.push("c");
        break;
      case "3":
        code.push("d");
        break;
      case "4":
        code.push("e");
        break;
      case "5":
        code.push("f");
        break;
      case "6":
        code.push("g");
        break;
      case "7":
        code.push("h");
        break;
      case "8":
        code.push("i");
        break;
      case "9":
        code.push("j");
        break;
    }
  });

  return code.join("");
}

export function CodeDeGenerator(code) {
  const details = {};

  const selectedPlatformChar = code[0];
  const selectedOptionChar = code[1] + code[2];
  const dateChar =
    code[3] +
    code[4] +
    code[5] +
    code[6] +
    code[7] +
    code[8] +
    code[9] +
    code[10];

  switch (selectedPlatformChar) {
    case "T":
      details.selectedPlatform = "Twitter";
      break;
    case "F":
      details.selectedPlatform = "Facebook";
      break;
    case "W":
      details.selectedPlatform = "Whatsapp";
      break;
    case "M":
      details.selectedPlatform = "Telegram";
      break;
    case "R":
      details.selectedPlatform = "Reddit";
      break;
    case "Y":
      details.selectedPlatform = "Youtube";
      break;
    case "O":
      details.selectedPlatform = "Other";
      break;
  }

  switch (selectedOptionChar) {
    case "po":
      details.selectedOption = "Post";
      break;
    case "co":
      details.selectedOption = "Comment";
      break;
    case "dm":
      details.selectedOption = "DM";
      break;
    case "cy":
      details.selectedOption = "Community";
      break;
    case "gp":
      details.selectedOption = "Group";
      break;
    case "ss":
      details.selectedOption = "Status";
      break;
    case "sr":
      details.selectedOption = "Subreddit";
      break;
    case "dn":
      details.selectedOption = "Description";
      break;
    case "oo":
      details.selectedOption = "Other";
      break;
  }

  details.date = [];
  dateChar.split("").forEach((digit) => {
    switch (digit) {
      case "a":
        details.date.push("0");
        break;
      case "b":
        details.date.push("1");
        break;
      case "c":
        details.date.push("2");
        break;
      case "d":
        details.date.push("3");
        break;
      case "e":
        details.date.push("4");
        break;
      case "f":
        details.date.push("5");
        break;
      case "g":
        details.date.push("6");
        break;
      case "h":
        details.date.push("7");
        break;
      case "i":
        details.date.push("8");
        break;
      case "j":
        details.date.push("9");
        break;
    }
  });

  details.date = details.date.join("");

  const day = details.date.slice(0, 2);
  const month = details.date.slice(2, 4);
  const year = details.date.slice(4);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formattedDate = `${day} ${monthNames[parseInt(month) - 1]} ${year}`;

  details.date = formattedDate;

  return details;
}
