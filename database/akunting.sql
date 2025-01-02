-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 02, 2025 at 03:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `akunting`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` int(11) NOT NULL,
  `code` int(5) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `code`, `name`) VALUES
(1, 101, 'kas'),
(2, 102, 'piutang'),
(3, 203, 'beban gaji'),
(4, 304, 'utang gaji'),
(5, 205, 'beban pajak'),
(6, 406, 'equitas'),
(7, 107, 'perlengkapan'),
(9, 209, 'beban listrik'),
(10, 210, 'beban sewa'),
(12, 202, 'beban perlengkapan');

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `descriptions` varchar(255) NOT NULL,
  `type` enum('debit','kredit') NOT NULL,
  `amount` int(11) NOT NULL,
  `ref` int(5) NOT NULL,
  `type_jurnal` varchar(255) NOT NULL,
  `hal` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`id`, `date`, `descriptions`, `type`, `amount`, `ref`, `type_jurnal`, `hal`) VALUES
(1, '2024-12-23', 'modal kas', 'debit', 35000000, 101, 'umum', 1),
(3, '2024-12-25', 'perlengkapan', 'debit', 15000000, 107, 'umum', 1),
(4, '2024-12-25', 'equitas', 'kredit', 50000000, 406, 'umum', 1),
(6, '2024-12-25', 'sewa gudang', 'debit', 15000000, 210, 'umum', 1),
(7, '2024-12-25', 'kas', 'kredit', 15000000, 101, 'umum', 1),
(8, '2024-12-29', 'beban gaji', 'debit', 3000000, 203, 'umum', 1),
(9, '2024-12-29', 'kas', 'kredit', 3000000, 101, 'umum', 1),
(10, '2024-12-30', 'beban gaji', 'debit', 2000000, 203, 'penyesuaian', 1),
(11, '2024-12-31', 'utang gaji', 'kredit', 2000000, 304, 'penyesuaian', 1),
(12, '2024-12-31', 'beban perlengkapan', 'debit', 5000000, 202, 'penyesuaian', 1),
(13, '2024-12-31', 'perlengkapan', 'kredit', 5000000, 107, 'penyesuaian', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
