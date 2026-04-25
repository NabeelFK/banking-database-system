DROP DATABASE IF EXISTS BankDB;
CREATE DATABASE IF NOT EXISTS BankDB;
USE BankDB;

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS User_Address;
DROP TABLE IF EXISTS Customer;
DROP TABLE IF EXISTS Branch;
DROP TABLE IF EXISTS Employee;
DROP TABLE IF EXISTS Assignment;
DROP TABLE IF EXISTS Dependent;
DROP TABLE IF EXISTS Department;
DROP TABLE IF EXISTS Depart_Location;
DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS Savings_acct;
DROP TABLE IF EXISTS Checking_acct;
DROP TABLE IF EXISTS Loan;
DROP TABLE IF EXISTS Payee;
DROP TABLE IF EXISTS Transaction;
DROP TABLE IF EXISTS Transfer;
DROP TABLE IF EXISTS Deposit;
DROP TABLE IF EXISTS Withdraw;
DROP TABLE IF EXISTS Owns;
DROP TABLE IF EXISTS Obtains;
DROP TABLE IF EXISTS Pays;
DROP TABLE IF EXISTS Logs;


CREATE TABLE `User` (
    UserID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Password_hash VARCHAR(255) NOT NULL,
    PRIMARY KEY (UserID)
);

CREATE TABLE User_Address (
    UserID INT NOT NULL,
    City VARCHAR(100) NOT NULL,
    Street VARCHAR(100) NOT NULL,
    Province VARCHAR(100) NOT NULL,
    Postal_code VARCHAR(20) NOT NULL,
    PRIMARY KEY (UserID, Street, City, Province, Postal_code),
    FOREIGN KEY (UserID) REFERENCES `User`(UserID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Customer (
    UserID INT NOT NULL,
    SSN VARCHAR(20) NOT NULL,
    PRIMARY KEY (UserID),
    FOREIGN KEY (UserID) REFERENCES `User`(UserID) ON DELETE CASCADE ON UPDATE CASCADE
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
    SSN VARCHAR(20) NOT NULL,
    BranchID INT,
    SupervisorID INT,
    PRIMARY KEY (UserID),
    FOREIGN KEY (UserID) REFERENCES `User`(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (SupervisorID) REFERENCES Employee(UserID) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Assignment(
    AssignmentID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Status VARCHAR(50) NOT NULL DEFAULT 'Active',
    Employee_UserID INT DEFAULT NULL,
    DepartmentID INT NOT NULL,
    Start_Date DATE NOT NULL,
    PRIMARY KEY (AssignmentID),
    FOREIGN KEY (Employee_UserID) REFERENCES Employee(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Dependent (
    UserID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Relationship VARCHAR(50),
    DOB DATE NOT NULL,
    PRIMARY KEY (UserID, Name, DOB),
    FOREIGN KEY (UserID) REFERENCES Employee(UserID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Department (
    DepartmentID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    BranchID INT,
    UserID INT,
    Start_Date DATE,
    PRIMARY KEY (DepartmentID),
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Employee(UserID) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Depart_Location (
    DepartmentID INT NOT NULL,
    Location VARCHAR(100) NOT NULL,
    PRIMARY KEY (DepartmentID, Location),
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Account (
    AccountID INT NOT NULL AUTO_INCREMENT,
    Status VARCHAR(50),
    Balance DECIMAL(15,2) DEFAULT 0.00,
    OpenDate DATE,
    PRIMARY KEY (AccountID)
);

CREATE TABLE Savings_acct (
    AccountID INT NOT NULL,
    Interest_rate DECIMAL(5,2),
    PRIMARY KEY (AccountID),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Checking_acct (
    AccountID INT NOT NULL,
    Overdraft_limit DECIMAL(15,2),
    PRIMARY KEY (AccountID),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Loan (
    Loan_No INT NOT NULL AUTO_INCREMENT,
    Amount DECIMAL(15,2) NOT NULL,
    BranchID INT,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    PRIMARY KEY (Loan_No),
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Payee (
    Payee_id INT NOT NULL,
    Company_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (Payee_id)
);


CREATE TABLE Transaction (
    TransactionID INT NOT NULL AUTO_INCREMENT,
    `Timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Amount DECIMAL(15,2) NOT NULL,
    Status VARCHAR(50),
    UserID INT,
    PRIMARY KEY (TransactionID),
    FOREIGN KEY (UserID) REFERENCES `User`(UserID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Transfer (
    TransactionID INT NOT NULL,
    ToAccountID INT,
    PRIMARY KEY (TransactionID),
    FOREIGN KEY (TransactionID) REFERENCES Transaction(TransactionID),
    FOREIGN KEY (ToAccountID) REFERENCES Account(AccountID)
);

CREATE TABLE Deposit (
TransactionID INT NOT NULL,
PRIMARY KEY (TransactionID),
FOREIGN KEY (TransactionID) REFERENCES Transaction(TransactionID) ON DElETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Withdraw (
TransactionID INT NOT NULL,
PRIMARY KEY (TransactionID),
FOREIGN KEY (TransactionID) REFERENCES Transaction(TransactionID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Owns (
    UserID INT NOT NULL,
    AccountID INT NOT NULL,
    PRIMARY KEY (UserID, AccountID),
    FOREIGN KEY (UserID) REFERENCES Customer(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Obtains (
    Customer_UserID INT NOT NULL,
    Loan_No INT NOT NULL,
    PRIMARY KEY (Customer_UserID, Loan_No),
    FOREIGN KEY (Customer_UserID) REFERENCES Customer(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Loan_No) REFERENCES Loan(Loan_No) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Pays (
    UserID INT NOT NULL,
    Payee_id INT NOT NULL,
    PRIMARY KEY (UserID, Payee_id),
    FOREIGN KEY (UserID) REFERENCES Customer(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Payee_id) REFERENCES Payee(Payee_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Logs (
    TransactionID INT NOT NULL,
    AccountID INT NOT NULL,
    PRIMARY KEY (TransactionID, AccountID),
    FOREIGN KEY (TransactionID) REFERENCES Transaction(TransactionID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `User` (UserID, Name, Phone, Email, Password_hash)
VALUES (101, 'Farhan Sheikh', '555-0100', 'farhan@gmail.com','$2a$12$P1PK2OtAXibafgS4.aoCBuymsgDwMhwIXge8Rz0XMegJ4fHTVpFlS'),
(102, 'Nabeel Furqan', '555-0101', 'nabeel@gmail.com','$2a$12$P1PK2OtAXibafgS4.aoCBuymsgDwMhwIXge8Rz0XMegJ4fHTVpFlS'),
(103, 'Minh Vu', '555-0102', 'minh@gmail.com','$2a$12$P1PK2OtAXibafgS4.aoCBuymsgDwMhwIXge8Rz0XMegJ4fHTVpFlS'),
(104, 'Alice Johnson', '403-111-0001', 'alice@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(105, 'Carol White', '403-111-0003', 'carol@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(106, 'Emma Davis', '403-111-0004', 'emma@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO Branch (BranchID, Name, Phone, Street, City, Province, Postal_Code)
VALUES (1, 'Downtown Branch', '555-9999', '123 Main St', 'Calgary', 'AB', 'T2N 2V1');

INSERT INTO Customer (UserID, SSN)
VALUES (101, '123-456-7890'),
(104, '111-222-3333');

INSERT INTO Employee (UserID, EmergencyNo, Role, BranchID, SupervisorID, SSN)
VALUES (103, '555-0888', 'Manager', 1, NULL, '567-890-1234'),
(102, '555-0999', 'Teller', 1, 103, '987-654-3210'),
(106, '403-555-0001', 'Manager', 1, NULL, '111-111-1111'),
(105, '403-555-0002', 'Teller', 1, 106, '222-222-2222');

INSERT INTO Assignment (Name, Description, Employee_UserID, DepartmentID, Start_Date)
VALUES ('Customer Service Training', 'Training for new customer service representatives', 102, 1, '2025-01-15'),
('Branch Management', 'Overseeing branch operations and staff', 103, 1, '2025-01-01'),
('Loan Processing', 'Handling loan applications and approvals', NULL, 1, '2025-02-01');

INSERT INTO Department (DepartmentID, Name, BranchID, UserID, Start_Date)
VALUES (1, 'Customer Service', 1, 103, '2025-01-01');

INSERT INTO Account (AccountID, Status, Balance, OpenDate)
VALUES (5001, 'Active', 2500.00, '2026-03-15'),
(5002, 'Active', 1500.00, '2026-03-20');

INSERT INTO Savings_acct (AccountID, Interest_rate)
VALUES (5001, 1.50);

INSERT INTO Checking_acct (AccountID, Overdraft_limit)
VALUES (5002, 500.00);

INSERT INTO Account (AccountID, Status, Balance, OpenDate)
VALUES (5003, 'Active', 1000.00, '2026-01-01');

INSERT INTO Savings_acct (AccountID, Interest_rate)
VALUES (5003, 1.50);

INSERT INTO Owns (UserID, AccountID)
VALUES (101, 5001),
(101, 5002),
(104, 5003);

UPDATE Account
SET Balance = Balance + 500.00
WHERE AccountID = 5001;

INSERT INTO Depart_Location (DepartmentID, Location)
VALUES (1, 'Second Floor');

INSERT INTO Loan (Loan_No, Amount, BranchID)
VALUES (101, 15000.00, 1),
(102, 25000.00, 1);

INSERT INTO Obtains (Customer_UserID, Loan_No)
VALUES (101, 101),
(101, 102);

INSERT INTO Payee (Payee_id, Company_name)
VALUES (1, 'Electric Company'),
(2, 'Water Utility');

INSERT INTO Pays (UserID, Payee_id)
VALUES (101, 1),
(101, 2);

INSERT INTO Transaction (TransactionID, `Timestamp`, Amount, UserID)
VALUES (1001, '2026-04-01 10:00:00', 200.00, 101),
(1002, '2026-04-02 14:30:00', 150.00, 101),
(1003, '2026-04-03 09:15:00', 300.00, 101);

INSERT INTO Logs (TransactionID, AccountID)
VALUES (1001, 5001),
(1002, 5001);

INSERT INTO Transfer (TransactionID)
VALUES (1001);

INSERT INTO Deposit (TransactionID)
VALUES (1002);

INSERT INTO Withdraw (TransactionID)
VALUES (1003);

SELECT u.Name, a.AccountID, a.Balance
FROM `User` u
JOIN Customer c ON u.UserID = c.UserID
JOIN Owns o ON c.UserID = o.UserID
JOIN Account a ON o.AccountID = a.AccountID
WHERE u.UserID = 101;

DELIMITER //

CREATE PROCEDURE GetCustomerSummary(IN p_UserID INT)
BEGIN
  SELECT a.AccountID, a.Balance, a.Status, a.OpenDate,
    CASE WHEN s.AccountID IS NOT NULL THEN 'Savings'
         WHEN c.AccountID IS NOT NULL THEN 'Checking'
    END as AccountType,
    s.Interest_rate, c.Overdraft_limit
  FROM Account a
  JOIN Owns o ON a.AccountID = o.AccountID
  LEFT JOIN Savings_acct s ON a.AccountID = s.AccountID
  LEFT JOIN Checking_acct c ON a.AccountID = c.AccountID
  WHERE o.UserID = p_UserID;

  SELECT l.Loan_No, l.Amount, l.Status
  FROM Loan l
  JOIN Obtains ob ON l.Loan_No = ob.Loan_No
  WHERE ob.Customer_UserID = p_UserID;

  SELECT p.Company_name
  FROM Payee p
  JOIN Pays py ON p.Payee_id = py.Payee_id
  WHERE py.UserID = p_UserID;
END //

CREATE PROCEDURE ProcessDeposit(
  IN p_AccountID INT,
  IN p_Amount DECIMAL(15,2),
  IN p_UserID INT
)
BEGIN
  DECLARE v_TransactionID INT;
  DECLARE v_Owned INT;

  SELECT COUNT(*) INTO v_Owned
  FROM Owns WHERE UserID = p_UserID AND AccountID = p_AccountID;

  IF v_Owned = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account does not belong to user';
  END IF;

  INSERT INTO `Transaction` (Amount, Status)
  VALUES (p_Amount, 'Completed');

  SET v_TransactionID = LAST_INSERT_ID();

  INSERT INTO Deposit (TransactionID) VALUES (v_TransactionID);
  UPDATE Account SET Balance = Balance + p_Amount WHERE AccountID = p_AccountID;
  INSERT INTO Logs (TransactionID, AccountID) VALUES (v_TransactionID, p_AccountID);

  SELECT v_TransactionID as TransactionID;
END //

CREATE PROCEDURE ProcessTransfer(
  IN p_FromAccountID INT,
  IN p_ToAccountID INT,
  IN p_Amount DECIMAL(15,2),
  IN p_UserID INT
)
BEGIN
  DECLARE v_Balance DECIMAL(15,2);
  DECLARE v_TransactionID INT;
  DECLARE v_Owned INT;

  SELECT COUNT(*) INTO v_Owned
  FROM Owns WHERE UserID = p_UserID AND AccountID = p_FromAccountID;

  IF v_Owned = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Source account does not belong to user';
  END IF;

  SELECT Balance INTO v_Balance FROM Account WHERE AccountID = p_FromAccountID;

  IF v_Balance < p_Amount THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance';
  END IF;

  INSERT INTO `Transaction` (Amount, Status) VALUES (p_Amount, 'Completed');
  SET v_TransactionID = LAST_INSERT_ID();

  INSERT INTO Transfer (TransactionID, ToAccountID) VALUES (v_TransactionID, p_ToAccountID);
  UPDATE Account SET Balance = Balance - p_Amount WHERE AccountID = p_FromAccountID;
  UPDATE Account SET Balance = Balance + p_Amount WHERE AccountID = p_ToAccountID;
  INSERT INTO Logs (TransactionID, AccountID) VALUES (v_TransactionID, p_FromAccountID);
  INSERT INTO Logs (TransactionID, AccountID) VALUES (v_TransactionID, p_ToAccountID);

  SELECT v_TransactionID as TransactionID;
END //

CREATE PROCEDURE GetBranchReport(IN p_BranchID INT)
BEGIN
  SELECT b.Name, b.City, b.Province,
    COUNT(DISTINCT e.UserID) as TotalEmployees,
    COUNT(DISTINCT a.AccountID) as TotalAccounts,
    SUM(a.Balance) as TotalDeposits,
    COUNT(DISTINCT l.Loan_No) as TotalLoans,
    SUM(l.Amount) as TotalLoanAmount
  FROM Branch b
  LEFT JOIN Employee e ON b.BranchID = e.BranchID
  LEFT JOIN Account a ON 1=1
  LEFT JOIN Loan l ON l.BranchID = b.BranchID
  WHERE b.BranchID = p_BranchID
  GROUP BY b.BranchID;
END //

CREATE PROCEDURE ApproveLoan(
  IN p_LoanNo INT,
  IN p_Status VARCHAR(50),
  IN p_EmployeeID INT
)
BEGIN
  IF p_Status NOT IN ('Approved', 'Rejected') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid status';
  END IF;

  UPDATE Loan SET Status = p_Status WHERE Loan_No = p_LoanNo;

  SELECT l.Loan_No, l.Amount, l.Status,
    u.Name as CustomerName
  FROM Loan l
  JOIN Obtains o ON l.Loan_No = o.Loan_No
  JOIN `User` u ON o.Customer_UserID = u.UserID
  WHERE l.Loan_No = p_LoanNo;
END //

DELIMITER ;


SET FOREIGN_KEY_CHECKS=1;

