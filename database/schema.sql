CREATE TABLE `User` (
UserID INT NOT NULL,
Name VARCHAR(100) NOT NULL,
Phone VARCHAR(20),
Email VARCHAR(100),
PRIMARY KEY (UserID)
);
CREATE TABLE User_Address (
UserID INT NOT NULL,
City VARCHAR(100) NOT NULL,
Street VARCHAR(100) NOT NULL,
Province VARCHAR(100) NOT NULL,
Postal_code VARCHAR(20) NOT NULL,
PRIMARY KEY (UserID, Street, City, Province, Postal_code),
FOREIGN KEY (UserID) REFERENCES `User`(UserID)
);
CREATE TABLE Customer (
UserID INT NOT NULL,
SSN VARCHAR(20) NOT NULL,
PRIMARY KEY (UserID),
FOREIGN KEY (UserID) REFERENCES `User`(UserID)
);
CREATE TABLE Branch (
BranchID INT NOT NULL,
Name VARCHAR(100) NOT NULL,
Phone VARCHAR(20),
Street VARCHAR(100),
City VARCHAR(100),
Province VARCHAR(100),
Postal_Code VARCHAR(20),
PRIMARY KEY (BranchID)
);
CREATE TABLE Employee (
UserID INT NOT NULL,
EmergencyNo VARCHAR(20),
Role VARCHAR(50),
BranchID INT,
SupervisorID INT,
PRIMARY KEY (UserID),
FOREIGN KEY (UserID) REFERENCES `User`(UserID),
FOREIGN KEY (BranchID) REFERENCES Branch(BranchID),
FOREIGN KEY (SupervisorID) REFERENCES Employee(UserID)
);
CREATE TABLE Dependent (
UserID INT NOT NULL,
Name VARCHAR(100) NOT NULL,
Relationship VARCHAR(50),
DOB DATE NOT NULL,
PRIMARY KEY (UserID, Name, DOB),
FOREIGN KEY (UserID) REFERENCES Employee(UserID)
);
CREATE TABLE Department (
DepartmentID INT NOT NULL,
Name VARCHAR(100) NOT NULL,
BranchID INT,
UserID INT,
Start_Date DATE,
PRIMARY KEY (DepartmentID),
FOREIGN KEY (BranchID) REFERENCES Branch(BranchID),
FOREIGN KEY (UserID) REFERENCES Employee(UserID)
);
CREATE TABLE Depart_Location (
DepartmentID INT NOT NULL,
Location VARCHAR(100) NOT NULL,
PRIMARY KEY (DepartmentID, Location),
FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);
CREATE TABLE Account (
AccountID INT NOT NULL,
Status VARCHAR(50),
Balance DECIMAL(15,2) DEFAULT 0.00,
OpenDate DATE,
PRIMARY KEY (AccountID)
);
CREATE TABLE Savings_acct (
AccountID INT NOT NULL,
Interest_rate DECIMAL(5,2),
PRIMARY KEY (AccountID),
FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);
CREATE TABLE Checking_acct (
AccountID INT NOT NULL,
Overdraft_limit DECIMAL(15,2),
PRIMARY KEY (AccountID),
FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);
CREATE TABLE Loan (
Loan_No INT NOT NULL,
Amount DECIMAL(15,2) NOT NULL,
BranchID INT,
PRIMARY KEY (Loan_No),
FOREIGN KEY (BranchID) REFERENCES Branch(BranchID)
);
CREATE TABLE Payee (
Payee_id INT NOT NULL,
Company_name VARCHAR(100) NOT NULL,
PRIMARY KEY (Payee_id)
);
CREATE TABLE `Transaction` (
TransactionID INT NOT NULL,
`Timestamp` DATETIME NOT NULL,
Amount DECIMAL(15,2) NOT NULL,
UserID INT,
PRIMARY KEY (TransactionID),
FOREIGN KEY (UserID) REFERENCES `User`(UserID)
);
CREATE TABLE Transfer (
TransactionID INT NOT NULL,
PRIMARY KEY (TransactionID),
FOREIGN KEY (TransactionID) REFERENCES `Transaction`(TransactionID)
);
CREATE TABLE Deposit (
TransactionID INT NOT NULL,
PRIMARY KEY (TransactionID),
FOREIGN KEY (TransactionID) REFERENCES `Transaction`(TransactionID)
);
CREATE TABLE Withdraw (
TransactionID INT NOT NULL,
PRIMARY KEY (TransactionID),
FOREIGN KEY (TransactionID) REFERENCES `Transaction`(TransactionID)
);
CREATE TABLE Owns (
UserID INT NOT NULL,
AccountID INT NOT NULL,
PRIMARY KEY (UserID, AccountID),
FOREIGN KEY (UserID) REFERENCES Customer(UserID),
FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);
CREATE TABLE Obtains (
Customer_UserID INT NOT NULL,
Loan_No INT NOT NULL,
PRIMARY KEY (Customer_UserID, Loan_No),
FOREIGN KEY (Customer_UserID) REFERENCES Customer(UserID),
FOREIGN KEY (Loan_No) REFERENCES Loan(Loan_No)
);
CREATE TABLE Pays (
UserID INT NOT NULL,
Payee_id INT NOT NULL,
PRIMARY KEY (UserID, Payee_id),
FOREIGN KEY (UserID) REFERENCES Customer(UserID),
FOREIGN KEY (Payee_id) REFERENCES Payee(Payee_id)
);
CREATE TABLE Logs (
TransactionID INT NOT NULL,
AccountID INT NOT NULL,
PRIMARY KEY (TransactionID, AccountID),
FOREIGN KEY (TransactionID) REFERENCES `Transaction`(TransactionID),
FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);