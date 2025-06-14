const fs = require("fs");
const path = require("path");

const toursFilePath = path.join(__dirname, "../data/travel.json");

let tours = [];
try {
  const data = fs.readFileSync(toursFilePath, "utf-8");
  tours = JSON.parse(data);
} catch (err) {
  console.error("Error reading tours file:", err.message);
}

exports.getAllTours = (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: tours,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve tours",
    });
  }
};

exports.createTour = (req, res) => {
  try {
    const newTour = { id: Date.now(), ...req.body };
    tours.push(newTour);
    fs.writeFileSync(toursFilePath, JSON.stringify(tours, null, 2));
    res.status(201).json({
      status: "success",
      data: newTour,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to create tour",
    });
  }
};

exports.updateTour = (req, res) => {
  try {
    const id = +req.params.id;
    const idx = tours.findIndex((t) => t.id === id);

    if (idx === -1) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    tours[idx] = { ...tours[idx], ...req.body };
    fs.writeFileSync(toursFilePath, JSON.stringify(tours, null, 2));

    res.status(200).json({
      status: "success",
      data: tours[idx],
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to update tour",
    });
  }
};

exports.deleteTour = (req, res) => {
  try {
    const id = +req.params.id;
    const exists = tours.some((t) => t.id === id);

    if (!exists) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    tours = tours.filter((t) => t.id !== id);
    fs.writeFileSync(toursFilePath, JSON.stringify(tours, null, 2));

    res.status(204).json();
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete tour",
    });
  }
};
