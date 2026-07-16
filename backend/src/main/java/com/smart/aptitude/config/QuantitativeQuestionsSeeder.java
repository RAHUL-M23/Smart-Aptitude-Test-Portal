package com.smart.aptitude.config;

import com.smart.aptitude.model.Question;
import com.smart.aptitude.model.Test;
import com.smart.aptitude.repository.QuestionRepository;
import java.util.ArrayList;
import java.util.List;

public class QuantitativeQuestionsSeeder {

    public static void seedQuantitativeQuestions(QuestionRepository questionRepository, Test testAptitude) {
        long count = questionRepository.countByCategory("Quantitative Aptitude");
        if (count >= 3300) {
            System.out.println("Quantitative Aptitude already has " + count + " questions seeded. Skipping.");
            return;
        }

        System.out.println("Seeding 3,300 Quantitative Aptitude questions (100 per sub-topic)...");
        
        String[][] subTopicsData = {
            // Number System
            {"Number System", "Divisibility Rules"},
            {"Number System", "Factors & Multiples"},
            {"Number System", "HCF & LCM"},
            {"Number System", "Remainders"},
            {"Number System", "Unit Digit"},
            
            // Arithmetic
            {"Arithmetic", "Percentage"},
            {"Arithmetic", "Profit & Loss"},
            {"Arithmetic", "Simple Interest"},
            {"Arithmetic", "Compound Interest"},
            {"Arithmetic", "Ratio & Proportion"},
            {"Arithmetic", "Partnership"},
            {"Arithmetic", "Average"},
            {"Arithmetic", "Age Problems"},
            {"Arithmetic", "Mixture & Allegation"},
            
            // Time Related
            {"Time Related", "Time & Work"},
            {"Time Related", "Pipes & Cisterns"},
            {"Time Related", "Time, Speed & Distance"},
            {"Time Related", "Trains"},
            {"Time Related", "Boats & Streams"},
            
            // Algebra
            {"Algebra", "Linear Equations"},
            {"Algebra", "Quadratic Equations"},
            {"Algebra", "Surds & Indices"},
            
            // Geometry & Mensuration
            {"Geometry & Mensuration", "Area"},
            {"Geometry & Mensuration", "Perimeter"},
            {"Geometry & Mensuration", "Volume"},
            {"Geometry & Mensuration", "Surface Area"},
            {"Geometry & Mensuration", "Circles"},
            {"Geometry & Mensuration", "Triangles"},
            
            // Permutation & Probability
            {"Permutation & Probability", "Permutation & Combination"},
            {"Permutation & Probability", "Probability"},
            
            // Data Interpretation
            {"Data Interpretation", "Tables"},
            {"Data Interpretation", "Pie Charts"},
            {"Data Interpretation", "Bar Graphs"}
        };

        List<Question> list = new ArrayList<>();
        int totalSeeded = 0;
        
        for (String[] subTopicInfo : subTopicsData) {
            String topic = subTopicInfo[0];
            String subTopic = subTopicInfo[1];
            
            for (int i = 1; i <= 100; i++) {
                Question q = generateQuestion(topic, subTopic, i, testAptitude.getTestId());
                list.add(q);
                
                // Batch save to prevent memory overflow
                if (list.size() >= 100) {
                    questionRepository.saveAll(list);
                    totalSeeded += list.size();
                    list.clear();
                }
            }
        }
        
        if (!list.isEmpty()) {
            questionRepository.saveAll(list);
            totalSeeded += list.size();
        }
        
        System.out.println("Completed seeding " + totalSeeded + " Quantitative Aptitude questions successfully!");
    }

    private static Question generateQuestion(String topic, String subTopic, int i, Long testId) {
        Question q = new Question();
        q.setCategory("Quantitative Aptitude");
        q.setSubTopic(subTopic);
        q.setTestId(testId);

        String questionText = "";
        String optA = "";
        String optB = "";
        String optC = "";
        String optD = "";
        String correct = "A";
        String explanation = "";

        // Deterministic variation values
        int val1 = 10 + (i * 7) % 90;
        int val2 = 5 + (i * 3) % 25;
        int val3 = 2 + (i * 2) % 15;
        
        switch (subTopic) {
            case "Divisibility Rules":
                // If a number is divisible by 9, sum of digits is divisible by 9
                // Let's construct a number 456X8i
                int sumSoFar = 4 + 5 + 6 + 8 + (i % 10);
                int needed = (9 - (sumSoFar % 9)) % 9;
                questionText = String.format("If the 6-digit number 456X8%d is divisible by 9, what is the value of the digit X?", i % 10);
                optA = String.valueOf(needed);
                optB = String.valueOf((needed + 3) % 10);
                optC = String.valueOf((needed + 5) % 10);
                optD = String.valueOf((needed + 7) % 10);
                correct = "A";
                explanation = String.format("A number is divisible by 9 if the sum of its digits is a multiple of 9. The sum of digits of 456X8%d is 4+5+6+X+8+%d = %d+X. For this sum to be divisible by 9, X must be %d.", i % 10, i % 10, sumSoFar, needed);
                break;

            case "Factors & Multiples":
                // Number of positive factors of 2^a * 3^b
                int a = 1 + (i % 4);
                int b = 1 + ((i + 1) % 3);
                int num = (int) (Math.pow(2, a) * Math.pow(3, b));
                int factors = (a + 1) * (b + 1);
                questionText = String.format("What is the total number of positive factors of the integer %d?", num);
                optA = String.valueOf(factors);
                optB = String.valueOf(factors + 2);
                optC = String.valueOf(factors - 1);
                optD = String.valueOf(factors * 2);
                correct = "A";
                explanation = String.format("The prime factorization of %d is 2^%d * 3^%d. The number of positive factors is calculated as (exponent1 + 1) * (exponent2 + 1) = (%d + 1) * (%d + 1) = %d.", num, a, b, a, b, factors);
                break;

            case "HCF & LCM":
                // product = HCF * LCM
                int hcf = 5 + (i % 15);
                int factor1 = 2 + (i % 5);
                int factor2 = 3 + ((i + 1) % 5);
                // ensure factors are coprime to maintain correct HCF
                if (factor1 == factor2) factor2 += 1;
                int n1 = hcf * factor1;
                int n2 = hcf * factor2;
                int lcm = hcf * factor1 * factor2;
                questionText = String.format("The HCF of two numbers is %d and their LCM is %d. If one of the numbers is %d, find the other number.", hcf, lcm, n1);
                optA = String.valueOf(n2);
                optB = String.valueOf(n2 + hcf);
                optC = String.valueOf(n2 - hcf);
                optD = String.valueOf(n2 * 2);
                correct = "A";
                explanation = String.format("Formula: HCF * LCM = Number1 * Number2. Therefore, %d * %d = %d * Number2, which gives Number2 = (%d * %d) / %d = %d.", hcf, lcm, n1, hcf, lcm, n1, n2);
                break;

            case "Remainders":
                // remainder of (base^power) % div
                // let base = 7, div = 6, remainder is always 1
                int power = 13 + i * 5;
                int base = 7 + (i % 5) * 6; // e.g. 7, 13, 19...
                int div = base - 1;
                questionText = String.format("What is the remainder when %d^%d is divided by %d?", base, power, div);
                optA = "1";
                optB = "0";
                optC = String.valueOf(div - 1);
                optD = "2";
                correct = "A";
                explanation = String.format("Since %d = %d * 1 + 1, we can write %d ≡ 1 (mod %d). Therefore, %d^%d ≡ 1^%d ≡ 1 (mod %d). The remainder is 1.", base, div, base, div, base, power, power, div);
                break;

            case "Unit Digit":
                // Unit digit of a^b
                // Cyclicity of 2 is 4 (2, 4, 8, 6)
                int pow = 21 + (i % 20);
                int uDigit = 2;
                int rem = pow % 4;
                if (rem == 1) uDigit = 2;
                else if (rem == 2) uDigit = 4;
                else if (rem == 3) uDigit = 8;
                else if (rem == 0) uDigit = 6;
                questionText = String.format("What is the unit digit of the expression 12^%d?", pow);
                optA = String.valueOf(uDigit);
                optB = String.valueOf((uDigit + 2) % 10);
                optC = String.valueOf((uDigit + 4) % 10);
                optD = String.valueOf((uDigit + 6) % 10);
                correct = "A";
                explanation = String.format("The unit digit of 12^%d is determined by the unit digit of 2^%d. The cyclicity of 2 is 4 (2, 4, 8, 6). Since %d mod 4 = %d, the unit digit is 2^%d (or 6 if remainder is 0), which is %d.", pow, pow, pow, rem, rem == 0 ? 4 : rem, uDigit);
                break;

            case "Percentage":
                // petrol price increase/decrease
                int pct = 10 + (i % 5) * 5; // 10, 15, 20, 25, 30
                double redPct = (100.0 * pct) / (100.0 + pct);
                double rounded = Math.round(redPct * 100.0) / 100.0;
                questionText = String.format("If the price of a commodity increases by %d%%, by how much percentage must a household reduce its consumption so as not to increase the expenditure?", pct);
                optA = String.format("%.2f%%", rounded);
                optB = String.format("%.2f%%", rounded + 2.5);
                optC = String.format("%.2f%%", rounded - 1.5);
                optD = String.format("%.2f%%", rounded * 1.1);
                correct = "A";
                explanation = String.format("Reduction percentage formula: [R / (100 + R)] * 100. Putting R = %d gives [%d / (100 + %d)] * 100 = %d/110 * 100 = %.2f%%.", pct, pct, pct, pct, rounded);
                break;

            case "Profit & Loss":
                int cp = 100 + i * 20;
                int profitPct = 5 + (i % 6) * 5; // 5, 10, 15, 20, 25, 30
                int sp = cp + (cp * profitPct) / 100;
                questionText = String.format("A retailer sells an item at a profit of %d%%. If the cost price of the item is $%d, what is its selling price?", profitPct, cp);
                optA = String.format("$%d", sp);
                optB = String.format("$%d", sp + 15);
                optC = String.format("$%d", sp - 20);
                optD = String.format("$%d", sp + 50);
                correct = "A";
                explanation = String.format("Selling Price (SP) = Cost Price (CP) * (1 + Profit%%/100) = %d * (1 + %d/100) = %d * %.2f = $%d.", cp, profitPct, cp, 1 + profitPct/100.0, sp);
                break;

            case "Simple Interest":
                int p = 1000 + i * 500;
                int r = 5 + (i % 6);
                int t = 2 + (i % 4);
                int si = (p * r * t) / 100;
                questionText = String.format("Calculate the simple interest on a principal amount of $%d for a period of %d years at an interest rate of %d%% per annum.", p, t, r);
                optA = String.format("$%d", si);
                optB = String.format("$%d", si + 100);
                optC = String.format("$%d", si - 50);
                optD = String.format("$%d", si * 2);
                correct = "A";
                explanation = String.format("Simple Interest formula: SI = (P * R * T) / 100. Plugging in the values: SI = (%d * %d * %d) / 100 = $%d.", p, r, t, si);
                break;

            case "Compound Interest":
                int principal = 5000 + i * 1000;
                int rate = 5 + (i % 6); // 5, 6, 7, 8, 9, 10
                double amt = principal * Math.pow(1 + rate/100.0, 2);
                int ci = (int) Math.round(amt - principal);
                questionText = String.format("What will be the compound interest on a sum of $%d for 2 years at %d%% per annum, compounded annually?", principal, rate);
                optA = String.format("$%d", ci);
                optB = String.format("$%d", ci + 150);
                optC = String.format("$%d", ci - 100);
                optD = String.format("$%d", ci + 300);
                correct = "A";
                explanation = String.format("Compound Interest formula: CI = P * (1 + R/100)^T - P. CI = %d * (1 + %d/100)^2 - %d = %d * %.4f - %d = $%d.", principal, rate, principal, principal, Math.pow(1 + rate/100.0, 2), principal, ci);
                break;

            case "Ratio & Proportion":
                int r1 = 2 + (i % 3);
                int r2 = 3 + (i % 4);
                int r3 = 5 + (i % 2);
                int sumParts = r1 + r2 + r3;
                int factor = 50 + (i % 10) * 10;
                int totalAmt = sumParts * factor;
                int shareB = r2 * factor;
                questionText = String.format("A sum of $%d is divided among A, B, and C in the ratio of %d:%d:%d. Find the share of B.", totalAmt, r1, r2, r3);
                optA = String.format("$%d", shareB);
                optB = String.format("$%d", shareB + 20);
                optC = String.format("$%d", shareB - 40);
                optD = String.format("$%d", shareB + 100);
                correct = "A";
                explanation = String.format("Total parts = %d + %d + %d = %d. Value of 1 part = $%d / %d = $%d. Therefore, B's share (%d parts) = %d * $%d = $%d.", r1, r2, r3, sumParts, totalAmt, sumParts, factor, r2, r2, factor, shareB);
                break;

            case "Partnership":
                int invA = 1000 + (i % 5) * 500;
                int invB = 1500 + (i % 4) * 500;
                int monthsA = 12;
                int monthsB = 6 + (i % 5);
                int ratioA = invA * monthsA;
                int ratioB = invB * monthsB;
                int gcd = gcd(ratioA, ratioB);
                int partA = ratioA / gcd;
                int partB = ratioB / gcd;
                int profitFactor = 100 + (i % 5) * 50;
                int totalProfit = (partA + partB) * profitFactor;
                int shareOfB = partB * profitFactor;
                questionText = String.format("A starts a business with $%d. After %d months, B joins the business with a capital of $%d. If the total annual profit is $%d, find B's share in the profit.", invA, 12 - monthsB, invB, totalProfit);
                optA = String.format("$%d", shareOfB);
                optB = String.format("$%d", shareOfB + 100);
                optC = String.format("$%d", shareOfB - 50);
                optD = String.format("$%d", shareOfB * 2);
                correct = "A";
                explanation = String.format("Profit sharing ratio = (Investment of A * Time of A) : (Investment of B * Time of B) = (%d * 12) : (%d * %d) = %d : %d, which simplifies to %d : %d. B's profit share = [%d / (%d + %d)] * $%d = $%d.", invA, invB, monthsB, ratioA, ratioB, partA, partB, partB, partA, partB, totalProfit, shareOfB);
                break;

            case "Average":
                int countStudents = 10 + (i % 10);
                int initialAvg = 50 + (i % 20);
                int newScore = 80 + (i % 21);
                int sumScores = countStudents * initialAvg;
                double newAvg = (double) (sumScores + newScore) / (countStudents + 1);
                double roundedAvg = Math.round(newAvg * 100.0) / 100.0;
                questionText = String.format("The average score of a group of %d students in an exam is %d. If a new student joins and scores %d, what is the new average score of the group?", countStudents, initialAvg, newScore);
                optA = String.format("%.2f", roundedAvg);
                optB = String.format("%.2f", roundedAvg + 1.25);
                optC = String.format("%.2f", roundedAvg - 0.75);
                optD = String.format("%.2f", roundedAvg + 3.0);
                correct = "A";
                explanation = String.format("Total score of %d students = %d * %d = %d. When student scoring %d joins, new sum = %d + %d = %d. Total students = %d. New average = %d / %d = %.2f.", countStudents, countStudents, initialAvg, sumScores, newScore, sumScores, newScore, sumScores + newScore, countStudents + 1, sumScores + newScore, countStudents + 1, roundedAvg);
                break;

            case "Age Problems":
                int currRatioA = 3 + (i % 3);
                int currRatioB = 4 + (i % 3);
                if (currRatioA == currRatioB) currRatioB += 1;
                int ageFactor = 3 + (i % 5);
                int currentAgeA = currRatioA * ageFactor;
                int currentAgeB = currRatioB * ageFactor;
                int yearsDiff = 4 + (i % 5) * 2;
                int ageAInFuture = currentAgeA + yearsDiff;
                int ageBInFuture = currentAgeB + yearsDiff;
                int futureGCD = gcd(ageAInFuture, ageBInFuture);
                int futureRatioA = ageAInFuture / futureGCD;
                int futureRatioB = ageBInFuture / futureGCD;
                questionText = String.format("The ratio of the current ages of A and B is %d:%d. After %d years, the ratio of their ages will become %d:%d. Find the current age of A.", currRatioA, currRatioB, yearsDiff, futureRatioA, futureRatioB);
                optA = String.valueOf(currentAgeA);
                optB = String.valueOf(currentAgeA + 5);
                optC = String.valueOf(currentAgeA - 3);
                optD = String.valueOf(currentAgeB);
                correct = "A";
                explanation = String.format("Let the current ages be %dx and %dx. After %d years: (%dx + %d) / (%dx + %d) = %d/%d. Cross-multiplying: %d(%dx + %d) = %d(%dx + %d), which simplifies to find x = %d. Therefore, current age of A = %d * %d = %d years.", currRatioA, currRatioB, yearsDiff, currRatioA, yearsDiff, currRatioB, yearsDiff, futureRatioA, futureRatioB, futureRatioB, currRatioA, yearsDiff, futureRatioA, currRatioB, yearsDiff, ageFactor, currRatioA, ageFactor, currentAgeA);
                break;

            case "Mixture & Allegation":
                int c1 = 40 + i * 2;
                int c2 = 60 + i * 2;
                int ratio1 = 1 + (i % 3);
                int ratio2 = 2 + (i % 3);
                double c3 = (double) (c1 * ratio1 + c2 * ratio2) / (ratio1 + ratio2);
                double roundedPrice = Math.round(c3 * 100.0) / 100.0;
                questionText = String.format("In what ratio must tea costing $%d per kg be mixed with tea costing $%d per kg so that the mixture is worth $%.2f per kg?", c1, c2, roundedPrice);
                optA = String.format("%d:%d", ratio1, ratio2);
                optB = String.format("%d:%d", ratio2, ratio1);
                optC = String.format("%d:%d", ratio1 + 1, ratio2);
                optD = "1:1";
                correct = "A";
                explanation = String.format("Using allegation rule: Ratio = (Dearer Price - Mean Price) : (Mean Price - Cheaper Price) = (%d - %.2f) : (%.2f - %d) = %.2f : %.2f, which simplifies to %d:%d.", c2, roundedPrice, roundedPrice, c1, c2 - roundedPrice, roundedPrice - c1, ratio1, ratio2);
                break;

            case "Time & Work":
                int timeA = 6 + (i % 10) * 2;
                int timeB = timeA * 2;
                double combinedTime = (double) (timeA * timeB) / (timeA + timeB);
                double roundedTime = Math.round(combinedTime * 100.0) / 100.0;
                questionText = String.format("A can complete a piece of work in %d days, while B can complete the same work in %d days. If they work together, how many days will they take to complete the work?", timeA, timeB);
                optA = String.format("%.2f days", roundedTime);
                optB = String.format("%.2f days", roundedTime + 1.5);
                optC = String.format("%.2f days", roundedTime - 0.75);
                optD = String.format("%.2f days", roundedTime * 1.3);
                correct = "A";
                explanation = String.format("A's 1 day work = 1/%d, B's 1 day work = 1/%d. Combined 1 day work = 1/%d + 1/%d = (%d + %d)/(%d) = %d/%d. Total days = %d/%d = %.2f days.", timeA, timeB, timeA, timeB, timeB, timeA, timeA * timeB, timeA + timeB, timeA * timeB, timeA * timeB, timeA + timeB, roundedTime);
                break;

            case "Pipes & Cisterns":
                int fillPipe = 4 + (i % 6);
                int emptyPipe = fillPipe + 2 + (i % 4);
                double netTime = (double) (fillPipe * emptyPipe) / (emptyPipe - fillPipe);
                double roundedNet = Math.round(netTime * 100.0) / 100.0;
                questionText = String.format("Pipe A can fill a cistern in %d hours, and Pipe B can empty it in %d hours. If both pipes are opened simultaneously in an empty cistern, how many hours will it take to fill the cistern completely?", fillPipe, emptyPipe);
                optA = String.format("%.2f hours", roundedNet);
                optB = String.format("%.2f hours", roundedNet + 2.0);
                optC = String.format("%.2f hours", roundedNet - 1.5);
                optD = String.format("%.2f hours", roundedNet * 1.25);
                correct = "A";
                explanation = String.format("Net work per hour = 1/%d - 1/%d = (%d - %d)/(%d * %d) = %d/%d. Time required = %d/%d = %.2f hours.", fillPipe, emptyPipe, emptyPipe, fillPipe, fillPipe, emptyPipe, emptyPipe - fillPipe, fillPipe * emptyPipe, fillPipe * emptyPipe, emptyPipe - fillPipe, roundedNet);
                break;

            case "Time, Speed & Distance":
                int speed1 = 40 + (i % 5) * 10;
                int speed2 = 60 + (i % 6) * 10;
                double avgSpeed = (2.0 * speed1 * speed2) / (speed1 + speed2);
                double roundedAvgSpeed = Math.round(avgSpeed * 100.0) / 100.0;
                questionText = String.format("A vehicle travels from city A to city B at a constant speed of %d km/h and returns from B to A at a constant speed of %d km/h. What is the average speed of the vehicle for the entire round trip?", speed1, speed2);
                optA = String.format("%.2f km/h", roundedAvgSpeed);
                optB = String.format("%.2f km/h", roundedAvgSpeed + 5.5);
                optC = String.format("%.2f km/h", roundedAvgSpeed - 4.25);
                optD = String.format("%.2f km/h", (double) (speed1 + speed2)/2.0);
                correct = "A";
                explanation = String.format("Average speed for same distance = 2xy / (x + y). Average speed = (2 * %d * %d) / (%d + %d) = %d / %d = %.2f km/h.", speed1, speed2, speed1, speed2, 2 * speed1 * speed2, speed1 + speed2, roundedAvgSpeed);
                break;

            case "Trains":
                int length = 100 + (i % 10) * 20;
                int time = 8 + (i % 5) * 2;
                double speedMS = (double) length / time;
                double speedKMH = speedMS * 3.6;
                double roundedSpeed = Math.round(speedKMH * 100.0) / 100.0;
                questionText = String.format("A train of length %d meters crosses a stationary pole in %d seconds. What is the speed of the train in km/h?", length, time);
                optA = String.format("%.2f km/h", roundedSpeed);
                optB = String.format("%.2f km/h", roundedSpeed + 6.0);
                optC = String.format("%.2f km/h", roundedSpeed - 4.5);
                optD = String.format("%.2f km/h", speedMS);
                correct = "A";
                explanation = String.format("Speed = Distance / Time = %d / %d = %.2f m/s. To convert to km/h, multiply by 18/5 (3.6): %.2f * 3.6 = %.2f km/h.", length, time, speedMS, speedMS, roundedSpeed);
                break;

            case "Boats & Streams":
                int speedBoat = 12 + (i % 8);
                int speedStream = 2 + (i % 4);
                int downstreamSpeed = speedBoat + speedStream;
                int distance = 40 + i * 5;
                double timeDown = (double) distance / downstreamSpeed;
                double roundedTimeDown = Math.round(timeDown * 100.0) / 100.0;
                questionText = String.format("A motorboat travels at %d km/h in still water. If the speed of the river current is %d km/h, how many hours will it take for the boat to travel %d km downstream?", speedBoat, speedStream, distance);
                optA = String.format("%.2f hours", roundedTimeDown);
                optB = String.format("%.2f hours", roundedTimeDown + 1.2);
                optC = String.format("%.2f hours", roundedTimeDown - 0.8);
                optD = String.format("%.2f hours", (double) distance / speedBoat);
                correct = "A";
                explanation = String.format("Downstream Speed = Speed of boat in still water + Speed of stream = %d + %d = %d km/h. Time taken = Distance / Downstream Speed = %d / %d = %.2f hours.", speedBoat, speedStream, downstreamSpeed, distance, downstreamSpeed, roundedTimeDown);
                break;

            case "Linear Equations":
                int coeff1 = 5 + (i % 5);
                int coeff2 = 2 + (i % 3);
                int const1 = 10 + i % 15;
                int xVal = 2 + (i % 10);
                int const2 = coeff1 * xVal + const1 - coeff2 * xVal;
                questionText = String.format("Solve the equation for x: %dx + %d = %dx + %d", coeff1, const1, coeff2, const2);
                optA = String.valueOf(xVal);
                optB = String.valueOf(xVal + 3);
                optC = String.valueOf(xVal - 2);
                optD = String.valueOf(-xVal);
                correct = "A";
                explanation = String.format("Subtracting %dx from both sides: (%d - %d)x + %d = %d => %dx + %d = %d. Subtracting %d: %dx = %d. Solving gives x = %d.", coeff2, coeff1, coeff2, const1, const2, coeff1 - coeff2, const1, const2, const1, coeff1 - coeff2, const2 - const1, xVal);
                break;

            case "Quadratic Equations":
                int root1 = 2 + (i % 6);
                int root2 = 3 + ((i + 1) % 5);
                int sumRoots = root1 + root2;
                int prodRoots = root1 * root2;
                questionText = String.format("Find the positive roots of the quadratic equation: x^2 - %dx + %d = 0", sumRoots, prodRoots);
                optA = String.format("x = %d or x = %d", root1, root2);
                optB = String.format("x = %d or x = %d", root1 + 1, root2 - 1);
                optC = String.format("x = %d or x = %d", root1 * 2, root2);
                optD = "None of the above";
                correct = "A";
                explanation = String.format("The equation can be factored as (x - %d)(x - %d) = 0. Therefore, the roots are x = %d and x = %d.", root1, root2, root1, root2);
                break;

            case "Surds & Indices":
                int baseVal = 2 + (i % 4);
                int p1 = 4 + (i % 5);
                int p2 = 2 + (i % 4);
                int p3 = 1 + (i % 3);
                int finalPower = p1 + p2 - p3;
                long resultVal = (long) Math.pow(baseVal, finalPower);
                questionText = String.format("Simplify and find the value of: (%d^%d * %d^%d) / %d^%d", baseVal, p1, baseVal, p2, baseVal, p3);
                optA = String.valueOf(resultVal);
                optB = String.valueOf(resultVal * baseVal);
                optC = String.valueOf(resultVal / baseVal);
                optD = String.valueOf(resultVal + 10);
                correct = "A";
                explanation = String.format("Using indices laws: a^m * a^n = a^(m+n) and a^m / a^n = a^(m-n). The expression simplifies to %d^(%d + %d - %d) = %d^%d = %d.", baseVal, p1, p2, p3, baseVal, finalPower, resultVal);
                break;

            case "Area":
                int l = 10 + i * 2;
                int w = 5 + i % 10;
                int area = l * w;
                questionText = String.format("Find the area of a rectangular field whose length is %d meters and width is %d meters.", l, w);
                optA = String.format("%d sq. meters", area);
                optB = String.format("%d sq. meters", area + 20);
                optC = String.format("%d sq. meters", area - 30);
                optD = String.format("%d sq. meters", (l + w) * 2);
                correct = "A";
                explanation = String.format("Area of rectangle = Length * Width = %d * %d = %d square meters.", l, w, area);
                break;

            case "Perimeter":
                int sideHex = 5 + i % 15;
                int perimeter = 6 * sideHex;
                questionText = String.format("What is the perimeter of a regular hexagon with each side measuring %d cm?", sideHex);
                optA = String.format("%d cm", perimeter);
                optB = String.format("%d cm", perimeter + 6);
                optC = String.format("%d cm", perimeter - 12);
                optD = String.format("%d cm", sideHex * 4);
                correct = "A";
                explanation = String.format("A regular hexagon has 6 equal sides. Perimeter = 6 * side length = 6 * %d = %d cm.", sideHex, perimeter);
                break;

            case "Volume":
                int radius = 3 + (i % 6);
                int height = 5 + (i % 10);
                double volume = Math.PI * radius * radius * height;
                double roundedVol = Math.round(volume * 100.0) / 100.0;
                questionText = String.format("Calculate the volume of a right circular cylinder having a base radius of %d cm and a height of %d cm. (Use π ≈ 3.14159)", radius, height);
                optA = String.format("%.2f cm³", roundedVol);
                optB = String.format("%.2f cm³", roundedVol + 25.5);
                optC = String.format("%.2f cm³", roundedVol - 15.0);
                optD = String.format("%.2f cm³", Math.PI * radius * height);
                correct = "A";
                explanation = String.format("Volume of cylinder = π * r² * h = π * %d² * %d = %d * %d * π = %d * π ≈ %.2f cm³.", radius, height, radius * radius, height, radius * radius * height, roundedVol);
                break;

            case "Surface Area":
                int edge = 4 + (i % 8);
                int sa = 6 * edge * edge;
                questionText = String.format("Find the total surface area of a cube with an edge length of %d cm.", edge);
                optA = String.format("%d cm²", sa);
                optB = String.format("%d cm²", sa + 24);
                optC = String.format("%d cm²", sa - 16);
                optD = String.format("%d cm²", edge * edge * edge);
                correct = "A";
                explanation = String.format("Total Surface Area of a cube = 6 * side² = 6 * %d² = 6 * %d = %d cm².", edge, edge * edge, sa);
                break;

            case "Circles":
                int circ = 44 + (i % 10) * 22;
                double rCirc = (circ * 7.0) / 44.0;
                double roundedR = Math.round(rCirc * 100.0) / 100.0;
                questionText = String.format("A circle has a circumference of %d cm. Find the radius of the circle. (Use π ≈ 22/7)", circ);
                optA = String.format("%.2f cm", roundedR);
                optB = String.format("%.2f cm", roundedR + 1.5);
                optC = String.format("%.2f cm", roundedR - 1.0);
                optD = String.format("%.2f cm", roundedR * 2.0);
                correct = "A";
                explanation = String.format("Circumference = 2 * π * r. Therefore, %d = 2 * (22/7) * r => %d = (44/7) * r => r = (%d * 7) / 44 = %.2f cm.", circ, circ, circ, roundedR);
                break;

            case "Triangles":
                int baseTri = 6 + i % 15;
                int heightTri = 8 + i % 10;
                double areaTri = 0.5 * baseTri * heightTri;
                questionText = String.format("Find the area of a triangle with a base of %d cm and a height of %d cm.", baseTri, heightTri);
                optA = String.format("%.1f cm²", areaTri);
                optB = String.format("%.1f cm²", areaTri + 4.5);
                optC = String.format("%.1f cm²", areaTri - 3.0);
                optD = String.format("%.1f cm²", (double) (baseTri + heightTri));
                correct = "A";
                explanation = String.format("Area of triangle = 1/2 * Base * Height = 1/2 * %d * %d = %.1f cm².", baseTri, heightTri, areaTri);
                break;

            case "Permutation & Combination":
                int nVal = 5 + (i % 6);
                int rVal = 2 + (i % 3);
                long ways = combination(nVal, rVal);
                questionText = String.format("In how many ways can a committee of %d members be chosen from a group of %d candidates?", rVal, nVal);
                optA = String.valueOf(ways);
                optB = String.valueOf(ways + 5);
                optC = String.valueOf(ways - 2);
                optD = String.valueOf(ways * 2);
                correct = "A";
                explanation = String.format("Number of combinations is calculated as nCr = n! / (r! * (n-r)!). Substituting n = %d, r = %d gives %dC%d = %d! / (%d! * %d!) = %d ways.", nVal, rVal, nVal, rVal, nVal, rVal, nVal - rVal, ways);
                break;

            case "Probability":
                int red = 3 + (i % 6);
                int blue = 4 + (i % 7);
                int totalBalls = red + blue;
                int probGCD = gcd(red, totalBalls);
                questionText = String.format("A bag contains %d red balls and %d blue balls. If one ball is drawn at random, what is the probability that it is red?", red, blue);
                optA = String.format("%d/%d", red / probGCD, totalBalls / probGCD);
                optB = String.format("%d/%d", blue / probGCD, totalBalls / probGCD);
                optC = String.format("1/%d", totalBalls);
                optD = "1/2";
                correct = "A";
                explanation = String.format("Total balls = %d + %d = %d. Favorable outcomes (red balls) = %d. Probability = Favorable Outcomes / Total Outcomes = %d/%d, which simplifies to %d/%d.", red, blue, totalBalls, red, red, totalBalls, red / probGCD, totalBalls / probGCD);
                break;

            case "Tables":
                int year1 = 200 + (i % 10) * 20;
                int year4 = year1 + 50 + (i % 5) * 10;
                double pctInc = ((double)(year4 - year1) / year1) * 100.0;
                double roundedPctInc = Math.round(pctInc * 100.0) / 100.0;
                questionText = String.format("Based on the sales data: Year 1 = $%d,000, Year 2 = $%d,000, Year 3 = $%d,000, Year 4 = $%d,000. What is the percentage increase in sales from Year 1 to Year 4?", year1, year1 + 15, year1 + 35, year4);
                optA = String.format("%.2f%%", roundedPctInc);
                optB = String.format("%.2f%%", roundedPctInc + 3.5);
                optC = String.format("%.2f%%", roundedPctInc - 2.0);
                optD = "None of the above";
                correct = "A";
                explanation = String.format("Increase in sales = $%d,000 - $%d,000 = $%d,000. Percentage Increase = (Increase / Year 1 Sales) * 100 = (%d / %d) * 100 = %.2f%%.", year4, year1, year4 - year1, year4 - year1, year1, roundedPctInc);
                break;

            case "Pie Charts":
                int income = 2000 + (i % 10) * 500;
                int rentPct = 25 + (i % 4) * 5;
                int rentAmt = (income * rentPct) / 100;
                questionText = String.format("A pie chart illustrates a household's monthly budget. The sector for 'Rent' is %d%%. If the total monthly household income is $%d, how much money is allocated for Rent?", rentPct, income);
                optA = String.format("$%d", rentAmt);
                optB = String.format("$%d", rentAmt + 100);
                optC = String.format("$%d", rentAmt - 75);
                optD = String.format("$%d", (income * (rentPct - 5)) / 100);
                correct = "A";
                explanation = String.format("Rent allocation = %d%% of $%d = (%d/100) * %d = $%d.", rentPct, income, rentPct, income, rentAmt);
                break;

            case "Bar Graphs":
                int prodA = 30 + (i % 10) * 5;
                int prodB = 40 + (i % 8) * 5;
                int barGCD = gcd(prodA, prodB);
                questionText = String.format("A bar graph displays the car production of two manufacturers. Manufacturer A: %d,000 cars, Manufacturer B: %d,000 cars. What is the ratio of production of Manufacturer A to Manufacturer B?", prodA, prodB);
                optA = String.format("%d:%d", prodA / barGCD, prodB / barGCD);
                optB = String.format("%d:%d", prodB / barGCD, prodA / barGCD);
                optC = "1:1";
                optD = String.format("%d:%d", prodA / barGCD + 1, prodB / barGCD);
                correct = "A";
                explanation = String.format("Ratio of Manufacturer A to Manufacturer B = %d,000 : %d,000 = %d : %d. Dividing by the GCD (%d) yields the simplified ratio of %d:%d.", prodA, prodB, prodA, prodB, barGCD, prodA / barGCD, prodB / barGCD);
                break;
        }

        int optionShift = i % 4;
        String finalCorrect = "A";
        
        if (optionShift == 1) {
            String temp = optA; optA = optB; optB = temp;
            finalCorrect = "B";
        } else if (optionShift == 2) {
            String temp = optA; optA = optC; optC = temp;
            finalCorrect = "C";
        } else if (optionShift == 3) {
            String temp = optA; optA = optD; optD = temp;
            finalCorrect = "D";
        }

        q.setQuestionText(questionText);
        q.setOptiona(optA);
        q.setOptionb(optB);
        q.setOptionc(optC);
        q.setOptiond(optD);
        q.setCorrectAnswer(finalCorrect);
        q.setExplanation(explanation);

        return q;
    }

    private static int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    private static long combination(int n, int r) {
        long res = 1;
        for (int idx = 1; idx <= r; idx++) {
            res = res * (n - r + idx) / idx;
        }
        return res;
    }
}
