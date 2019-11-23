CREATE TABLE VehicleType (vtname TEXT PRIMARY KEY, 
                        features TEXT,
                        wrate float, 
                        drate float,
                        hrate float, 
                        wirate float,
                        dirate float,
                        hirate float, 
                        krate float
                        );

CREATE TABLE Customer (dlicense TEXT PRIMARY KEY,
                    name TEXT, 
                    address TEXT
                    );

CREATE TABLE Vehicles (vid INT PRIMARY KEY,
    vlicense TEXT, 
    make TEXT,
    model TEXT,
    year TEXT, 
    color TEXT,
    odometer INT,
    status vehicle_status,
    vtname TEXT REFERENCES VehicleType(vtname),
    location TEXT,
    city TEXT
  );

CREATE TABLE Reservation (confNo INT PRIMARY KEY, 
                        vtName TEXT REFERENCES VehicleType(vtName), 
                        dlicense TEXT REFERENCES Customer(dlicense), 
                        fromDate Timestamp, 
                        toDate Timestamp
                    );

CREATE TABLE Rent (rid INT PRIMARY KEY,
                vid INT REFERENCES Vehicles(vid),
                dlicense TEXT REFERENCES Customer(dlicense),
                fromDate Timestamp, 
                toDate Timestamp, 
                odometer INT, 
                cardName TEXT, 
                cardNo TEXT, 
                expDate Date, 
                confNo INT REFERENCES Reservation(confNo)
            );


CREATE TABLE Return (rid INT PRIMARY KEY REFERENCES Rent(rid),
                date Timestamp,
                odometer INT,
                fulltank boolean,
                value float
                );
