CREATE VIEW Rented(vid, vlicense, make, model, year, color, odometer, status, vtname, location, city) AS
SELECT vid, vlicense, make, model, year, color, odometer, status, vtname, location, city
FROM Vehicles
WHERE status='rented';

CREATE VIEW ForRent(vid, vlicense, make, model, year, color, odometer, status, vtname, location, city) AS
SELECT vid, vlicense, make, model, year, color, odometer, status, vtname, location, city
FROM Vehicles
WHERE status='available';

CREATE VIEW UnderMaintenance(vid, vlicense, make, model, year, color, odometer, status, vtname, location, city) AS
SELECT vid, vlicense, make, model, year, color, odometer, status, vtname, location, city
FROM Vehicles
WHERE status='maintenance';

