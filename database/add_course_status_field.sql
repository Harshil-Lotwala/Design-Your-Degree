-- Add status field to StudentCourseSelections table
USE DegreePlanner;

-- Add status column to track course progress
ALTER TABLE StudentCourseSelections 
ADD COLUMN status ENUM('Remaining', 'In Progress', 'Completed') DEFAULT 'Remaining' AFTER is_approved;

-- Update existing records to have 'Remaining' status by default
UPDATE StudentCourseSelections SET status = 'Remaining' WHERE status IS NULL;
