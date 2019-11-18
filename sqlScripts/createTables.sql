CREATE TABLE TimePeriod (fromDate Date, 
                fromTime Time, 
                toDate Date, 
                toTime Time,
                PRIMARY KEY (fromDate, fromTime, toDate, toTime)
);

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
                    points INT, 
                    fees float
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
                        fromDate Date, 
                        fromTime Time, 
                        toDate Date, 
                        toTime Time,
                        FOREIGN KEY (fromDate, fromTime, toDate, toTime) REFERENCES TimePeriod (fromDate, fromTime, toDate, toTime)
                    );

CREATE TABLE Rent (rid INT PRIMARY KEY,
                vid INT REFERENCES Vehicles(vid),
                dlicense TEXT REFERENCES Customer(dlicense),
                fromDate Date, 
                fromTime Time, 
                toDate Date, 
                toTime Time, 
                odometer INT, 
                cardName TEXT, 
                cardNo TEXT, 
                expDate Date, 
                confNo INT REFERENCES Reservation(confNo),
                FOREIGN KEY (fromDate, fromTime, toDate, toTime) REFERENCES TimePeriod (fromDate, fromTime, toDate, toTime)
            );


CREATE TABLE Return (rid INT PRIMARY KEY REFERENCES Rent(rid),
                date Date,
                time Time,
                odometer INT,
                fulltank boolean,
                value float
                );
