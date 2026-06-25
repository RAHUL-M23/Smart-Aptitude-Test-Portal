package com.smart.aptitude.config;

import com.smart.aptitude.model.Question;
import com.smart.aptitude.model.Test;
import com.smart.aptitude.model.User;
import com.smart.aptitude.repository.QuestionRepository;
import com.smart.aptitude.repository.TestRepository;
import com.smart.aptitude.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Seed default users
        seedUser("admin7@gmail.com", "System Admin", "admin@77", "ROLE_ADMIN", "ADMIN007", "Administration");
        seedUser("student@example.com", "Alex Student", "student123", "ROLE_STUDENT", "ROLL1001", "Computer Science");
        seedUser("rahul@gmail.com", "rahul m", "rahul123", "ROLE_STUDENT", "ROLL1002", "Information Technology");

        // Seed 3 distinct tests (Requirement 1 & 2)
        Test testAptitude = seedTest(1L, "Quantitative Aptitude", "Aptitude", 20, 20);
        Test testVerbal = seedTest(2L, "Verbal Ability", "Verbal", 20, 20);
        Test testReasoning = seedTest(3L, "Logical Reasoning", "Reasoning", 20, 20);

        // Check if database contains old questions or needs re-seeding
        boolean needsReseed = true;


        // Seed 505 questions partitioned across the 3 tests
        if (needsReseed) {
            System.out.println("Partitioning and seeding 505 questions pool into 3 tests...");
            questionRepository.deleteAllInBatch(); // Clean up existing

            List<Question> questionsPool = new ArrayList<>();
            String[] names = {"Sarah", "David", "Emma", "John", "Sophia", "Michael", "Olivia", "James", "Isabella", "Robert", "Grace", "Daniel", "Chloe", "William", "Lily", "Joseph", "Mia", "Charles", "Emily", "Thomas"};
            String[] companies = {"TechCorp", "InnovateLtd", "GlobalSolutions", "WebSoft", "ApexSystems", "NovaIndustries", "CoreConsulting", "QuantumLabs", "BlueSkyInc", "DeltaVentures"};
            String[] items = {"Laptop", "Smartwatch", "Tablet", "Monitor", "Keyboard", "Headphones", "Printer", "Router", "Desk Lamp", "Office Chair"};

            for (int i = 1; i <= 600; i++) {
                Question q = new Question();
                int categoryType = i % 3;

                if (categoryType == 0) {
                    // Quantitative (Aptitude) -> test_id = 1
                    q.setTestId(testAptitude.getTestId());
                    int templateId = i % 10;
                    String name = names[i % names.length];
                    String company = companies[i % companies.length];
                    String item = items[i % items.length];

                    if (templateId == 0) {
                        int x = 10 + (i * 7) % 90;
                        int y = 5 + (i * 3) % 25;
                        int aCount = 3 + i % 5;
                        int bCount = 2 + i % 4;
                        int total = aCount * x + bCount * y;
                        q.setQuestionText("Aptitude Scenario: " + name + " is purchasing IT hardware for " + company + ". They order " + aCount + " units of " + item + " A at $" + x + " each, and " + bCount + " units of " + item + " B at $" + y + " each. What is the total procurement cost for this transaction?");
                        q.setOptiona("$" + total);
                        q.setOptionb("$" + (total + 15));
                        q.setOptionc("$" + (total - 25));
                        q.setOptiond("$" + (total + 50));
                        q.setCorrectAnswer("A");
                    } else if (templateId == 1) {
                        int dist = 100 + (i * 13) % 400;
                        int speed = 40 + (i * 5) % 40;
                        double hours = (double) dist / speed;
                        double rounded = Math.round(hours * 10.0) / 10.0;
                        q.setQuestionText("Aptitude Scenario: A delivery coordinator at " + company + " is mapping a route from warehouse X to warehouse Y, a distance of " + dist + " miles. If the transport vehicle travels at a constant speed of " + speed + " mph, approximately how many hours will the trip take?");
                        q.setOptiona(String.valueOf(rounded - 1.2) + " hours");
                        q.setOptionb(String.valueOf(rounded) + " hours");
                        q.setOptionc(String.valueOf(rounded + 0.8) + " hours");
                        q.setOptiond(String.valueOf(rounded + 2.0) + " hours");
                        q.setCorrectAnswer("B");
                    } else if (templateId == 2) {
                        int lines = 1000 + (i * 150) % 5000;
                        int devA = 50 + (i * 10) % 100;
                        int devB = 40 + (i * 8) % 80;
                        int hours = lines / (devA + devB);
                        q.setQuestionText("Aptitude Scenario: " + name + " and team at " + company + " must write " + lines + " lines of code. Developer A writes at a rate of " + devA + " lines/hour, and Developer B writes at a rate of " + devB + " lines/hour. If they work simultaneously, how many hours will it take them to complete the code?");
                        q.setOptiona(String.valueOf(hours + 5) + " hours");
                        q.setOptionb(String.valueOf(hours - 2) + " hours");
                        q.setOptionc(String.valueOf(hours) + " hours");
                        q.setOptiond(String.valueOf(hours + 10) + " hours");
                        q.setCorrectAnswer("C");
                    } else if (templateId == 3) {
                        int desks = 15 + (i * 4) % 30;
                        int chairsPerDesk = 2;
                        int spare = 5 + i % 10;
                        int totalChairs = desks * chairsPerDesk + spare;
                        q.setQuestionText("Aptitude Scenario: " + name + ", the office manager at " + company + ", is setting up a new workspace with " + desks + " desks. Each desk requires " + chairsPerDesk + " ergonomic chairs. In addition, " + name + " orders " + spare + " spare chairs for visitors. How many total chairs must be ordered?");
                        q.setOptiona(String.valueOf(totalChairs - 5));
                        q.setOptionb(String.valueOf(totalChairs + 10));
                        q.setOptionc(String.valueOf(totalChairs + 4));
                        q.setOptiond(String.valueOf(totalChairs));
                        q.setCorrectAnswer("D");
                    } else if (templateId == 4) {
                        int employees = 20 + (i * 11) % 80;
                        int cupsPerWeek = 4 + i % 5;
                        double costPerCup = 1.5 + (i % 4) * 0.25;
                        double weeklyCost = employees * cupsPerWeek * costPerCup;
                        q.setQuestionText("Aptitude Scenario: At " + company + ", there are " + employees + " staff members. Each drinks an average of " + cupsPerWeek + " cups of coffee per week. If coffee beans cost $" + costPerCup + " per cup, what is the total weekly coffee expense for the office?");
                        q.setOptiona("$" + weeklyCost);
                        q.setOptionb("$" + (weeklyCost + 25.0));
                        q.setOptionc("$" + (weeklyCost - 15.0));
                        q.setOptiond("$" + (weeklyCost * 1.2));
                        q.setCorrectAnswer("A");
                    } else if (templateId == 5) {
                        int total = 50 + (i * 17) % 150;
                        int defective = 2 + (i % 8);
                        double percentage = ((double) defective / total) * 100.0;
                        double roundedPct = Math.round(percentage * 10.0) / 10.0;
                        q.setQuestionText("Aptitude Scenario: " + name + " is conducting quality assurance at " + company + ". In a batch of " + total + " units of " + item + "s, " + defective + " units are found to have defects. If a client randomly inspects one unit, what is the percentage probability that the selected unit has defects?");
                        q.setOptiona(String.valueOf(roundedPct + 2.5) + "%");
                        q.setOptionb(String.valueOf(roundedPct) + "%");
                        q.setOptionc(String.valueOf(roundedPct - 1.2) + "%");
                        q.setOptiond(String.valueOf(roundedPct * 1.5) + "%");
                        q.setCorrectAnswer("B");
                    } else if (templateId == 6) {
                        int rent = 2000 + (i * 250) % 5000;
                        int pct = 5 + (i % 6);
                        int increase = (rent * pct) / 100;
                        int newRent = rent + increase;
                        q.setQuestionText("Aptitude Scenario: A tech startup is leasing office space in City Center for $" + rent + " per month. Under the lease terms, the rent will increase by " + pct + "% starting next month. What will the startup's new monthly rent be?");
                        q.setOptiona("$" + (newRent - 100));
                        q.setOptionb("$" + (newRent + 200));
                        q.setOptionc("$" + newRent);
                        q.setOptiond("$" + (newRent + 50));
                        q.setCorrectAnswer("C");
                    } else if (templateId == 7) {
                        int salary = 3000 + (i * 100) % 2000;
                        int commPct = 2 + (i % 5);
                        int sales = 10000 + (i * 1000) % 30000;
                        int totalEarned = salary + (sales * commPct) / 100;
                        q.setQuestionText("Aptitude Scenario: " + name + ", a sales consultant at " + company + ", has a base salary of $" + salary + "/month plus a " + commPct + "% commission on all closed sales. If " + name + " closes $" + sales + " in sales this month, what will their total monthly earnings be?");
                        q.setOptiona(String.valueOf(totalEarned - 150));
                        q.setOptionb(String.valueOf(totalEarned + 300));
                        q.setOptionc(String.valueOf(totalEarned - 500));
                        q.setOptiond(String.valueOf(totalEarned));
                        q.setCorrectAnswer("D");
                    } else if (templateId == 8) {
                        int original = 500 + (i * 50) % 1500;
                        int discount = 10 + (i % 5) * 5;
                        int finalPrice = original - (original * discount) / 100;
                        q.setQuestionText("Aptitude Scenario: An operations lead is purchasing a server setup listed at $" + original + ". The hardware vendor offers a bulk-buying discount of " + discount + "% for corporate clients. What will the final price of the server be?");
                        q.setOptiona("$" + finalPrice);
                        q.setOptionb("$" + (finalPrice + 45));
                        q.setOptionc("$" + (finalPrice - 20));
                        q.setOptiond("$" + (finalPrice * 1.1));
                        q.setCorrectAnswer("A");
                    } else {
                        int execs = 2 + (i % 3);
                        int execPay = 8000 + (i * 200) % 4000;
                        int staff = 5 + (i % 5);
                        int staffPay = 3000 + (i * 150) % 2000;
                        int avg = (execs * execPay + staff * staffPay) / (execs + staff);
                        q.setQuestionText("Aptitude Scenario: A payroll manager at " + company + " is review salaries. The department has " + execs + " managers earning $" + execPay + "/month each and " + staff + " specialists earning $" + staffPay + "/month each. What is the average monthly salary of these employees?");
                        q.setOptiona("$" + (avg - 120));
                        q.setOptionb("$" + avg);
                        q.setOptionc("$" + (avg + 85));
                        q.setOptiond("$" + (avg + 300));
                        q.setCorrectAnswer("B");
                    }
                } else if (categoryType == 1) {
                    // Verbal spelling (Verbal) -> test_id = 2
                    q.setTestId(testVerbal.getTestId());
                    int templateId = i % 10;
                    String name = names[i % names.length];
                    String company = companies[i % companies.length];

                    if (templateId == 0) {
                        String[] words = {"accommodation", "achievement", "auxiliary", "bizarre", "calendar", "definitely", "ecstasy", "hierarchy", "inoculate", "maintenance"};
                        String correct = words[i % words.length];
                        q.setQuestionText("Verbal Scenario: In an official memo drafted by " + name + " for " + company + ", one of the key terms is misspelled in draft. Which spelling is correct for the underlined word?");
                        q.setOptiona("Incorrect Spelling A");
                        q.setOptionb("Incorrect Spelling B");
                        q.setOptionc(correct);
                        q.setOptiond("Incorrect Spelling D");
                        q.setCorrectAnswer("C");
                    } else if (templateId == 1) {
                        q.setQuestionText("Verbal Scenario: " + name + " is drafting an apology email to a major client of " + company + ": 'We sincerely apologize for any ________ caused by yesterday's server maintenance.' Which word is most appropriate?");
                        q.setOptiona("discomfort");
                        q.setOptionb("irritation");
                        q.setOptionc("distress");
                        q.setOptiond("inconvenience");
                        q.setCorrectAnswer("D");
                    } else if (templateId == 2) {
                        q.setQuestionText("Verbal Scenario: A job description published by " + company + " states: 'We are seeking an engineer capable of ________ complex requirements into efficient architectures.' Which word best fits the context?");
                        q.setOptiona("translating");
                        q.setOptionb("complicating");
                        q.setOptionc("mutating");
                        q.setOptiond("exchanging");
                        q.setCorrectAnswer("A");
                    } else if (templateId == 3) {
                        q.setQuestionText("Verbal Scenario: In a performance review, the director tells " + name + ": 'Your work this quarter has been ________, but there is still room to grow.' Which word represents a positive yet constructive review?");
                        q.setOptiona("negligible");
                        q.setOptionb("satisfactory");
                        q.setOptionc("terrible");
                        q.setOptiond("perfect");
                        q.setCorrectAnswer("B");
                    } else if (templateId == 4) {
                        q.setQuestionText("Verbal Scenario: A financial report notes: 'The initial budget estimate was too ________, resulting in a large surplus at the end of the year.' Which word best explains the surplus?");
                        q.setOptiona("extravagant");
                        q.setOptionb("wasteful");
                        q.setOptionc("conservative");
                        q.setOptiond("precise");
                        q.setCorrectAnswer("C");
                    } else if (templateId == 5) {
                        q.setQuestionText("Verbal Scenario: " + name + " is addressing a panel of potential international partners. Which of the following is the most professional greeting to open the presentation?");
                        q.setOptiona("Hey guys, let's get started.");
                        q.setOptionb("What's up partners, good morning.");
                        q.setOptionc("To whom it may concern, hello.");
                        q.setOptiond("Dear partners and colleagues, welcome.");
                        q.setCorrectAnswer("D");
                    } else if (templateId == 6) {
                        q.setQuestionText("Verbal Scenario: A technical support guide states: 'Performing regular database backups will ________ the risk of accidental data loss.' Which word is correct?");
                        q.setOptiona("mitigate");
                        q.setOptionb("escalate");
                        q.setOptionc("agitate");
                        q.setOptiond("instigate");
                        q.setCorrectAnswer("A");
                    } else if (templateId == 7) {
                        q.setQuestionText("Verbal Scenario: During contract negotiations, the legal counsel of " + company + " clarifies: 'This particular clause is non-negotiable; it is ________ for both parties.' Which word is correct?");
                        q.setOptiona("optional");
                        q.setOptionb("binding");
                        q.setOptionc("temporary");
                        q.setOptiond("negotiable");
                        q.setCorrectAnswer("B");
                    } else if (templateId == 8) {
                        q.setQuestionText("Verbal Scenario: The project documentation concludes: 'The steering committee reached a ________ on the design phase.' Which word indicates complete agreement?");
                        q.setOptiona("division");
                        q.setOptionb("conflict");
                        q.setOptionc("consensus");
                        q.setOptiond("doubt");
                        q.setCorrectAnswer("C");
                    } else {
                        q.setQuestionText("Verbal Scenario: In the handbook, " + name + " writes: 'Employees are ________ advised to update their passwords every 30 days.' Which word is correct?");
                        q.setOptiona("barely");
                        q.setOptionb("rarely");
                        q.setOptionc("hazardously");
                        q.setOptiond("strongly");
                        q.setCorrectAnswer("D");
                    }
                } else {
                    // Logical reasoning (Reasoning) -> test_id = 3
                    q.setTestId(testReasoning.getTestId());
                    int templateId = i % 10;
                    String nameA = names[(i) % names.length];
                    String nameB = names[(i + 1) % names.length];
                    String nameC = names[(i + 2) % names.length];
                    String nameD = names[(i + 3) % names.length];

                    if (templateId == 0) {
                        q.setQuestionText("Reasoning Scenario: At a roundtable at " + nameA + "'s firm, 4 executives (" + nameA + ", " + nameB + ", " + nameC + ", " + nameD + ") sit in order. If " + nameA + " is next to " + nameB + ", and " + nameC + " is not next to " + nameD + ", and " + nameD + " sits on the far left. Who must sit on the far right?");
                        q.setOptiona(nameC);
                        q.setOptionb(nameA);
                        q.setOptionc(nameB);
                        q.setOptiond("Cannot be determined");
                        q.setCorrectAnswer("A");
                    } else if (templateId == 1) {
                        int shift = 1 + (i % 4);
                        q.setQuestionText("Reasoning Scenario: A secure server encrypts messages by shifting letters forward by " + shift + " positions in the alphabet (A becomes B for shift 1). If the word 'TEST' is encrypted, what will the first letter be?");
                        char firstChar = (char) ('T' + shift);
                        q.setOptiona("S");
                        q.setOptionb(String.valueOf(firstChar));
                        q.setOptionc("P");
                        q.setOptiond("U");
                        q.setCorrectAnswer("B");
                    } else if (templateId == 2) {
                        q.setQuestionText("Reasoning Scenario: " + nameA + " is planning 4 tasks (Task A, Task B, Task C, Task D). If Task A must be completed before Task B, Task C must be completed after Task B, and Task D is the final task, which task must be performed second?");
                        q.setOptiona("Task A");
                        q.setOptionb("Task C");
                        q.setOptionc("Task B");
                        q.setOptiond("Task D");
                        q.setCorrectAnswer("C");
                    } else if (templateId == 3) {
                        q.setQuestionText("Reasoning Scenario: In an organizational chart, " + nameA + " is the manager of " + nameB + ", who is the sibling of " + nameC + ". If " + nameC + " is the parent of " + nameD + ", what is the relationship of " + nameA + " to " + nameD + "'s parent's manager?");
                        q.setOptiona("Parent");
                        q.setOptionb("Child");
                        q.setOptionc("Sibling");
                        q.setOptiond("None of the above");
                        q.setCorrectAnswer("D");
                    } else if (templateId == 4) {
                        q.setQuestionText("Reasoning Scenario: A security policy states: 'If the server room temperature exceeds 30°C, the automatic exhaust fan turns on.' If the exhaust fan is currently turned OFF, what can be logically deduced?");
                        q.setOptiona("The server room temperature is 30°C or lower.");
                        q.setOptionb("The server room is overheated.");
                        q.setOptionc("The exhaust fan is broken.");
                        q.setOptiond("Nothing can be logically deduced.");
                        q.setCorrectAnswer("A");
                    } else if (templateId == 5) {
                        q.setQuestionText("Reasoning Scenario: " + nameA + " needs to select a team of 3 from 5 candidates (A, B, C, D, E). If A and B cannot be on the same team, and C must be selected, which of the following is a valid team selection?");
                        q.setOptiona("A, B, C");
                        q.setOptionb("A, C, D");
                        q.setOptionc("B, D, E");
                        q.setOptiond("A, B, E");
                        q.setCorrectAnswer("B");
                    } else if (templateId == 6) {
                        q.setQuestionText("Reasoning Scenario: Five project phases (P1, P2, P3, P4, P5) are scheduled Mon-Fri. P1 is on Monday, P3 must be immediately after P2, and P5 is on Friday. If P2 is scheduled on Tuesday, on which day must P4 be scheduled?");
                        q.setOptiona("Wednesday");
                        q.setOptionb("Tuesday");
                        q.setOptionc("Thursday");
                        q.setOptiond("Monday");
                        q.setCorrectAnswer("C");
                    } else if (templateId == 7) {
                        int pos = 10 + (i % 6);
                        q.setQuestionText("Reasoning Scenario: A monitor logs server statuses in a repeating pattern: 'OK, OK, WARN, OK, OK, WARN...'. What will the status at position " + pos + " be?");
                        String ans = (pos % 3 == 0) ? "WARN" : "OK";
                        q.setOptiona("OK");
                        q.setOptionb("WARN");
                        q.setOptionc("ERROR");
                        q.setOptiond(ans);
                        q.setCorrectAnswer("D");
                    } else if (templateId == 8) {
                        int java = 20 + (i % 10);
                        int python = 15 + (i % 8);
                        int both = 5 + (i % 4);
                        int onlyJava = java - both;
                        q.setQuestionText("Reasoning Scenario: In " + nameA + "'s department, " + java + " engineers know Java, " + python + " know Python, and " + both + " know both languages. How many engineers in the department know only Java?");
                        q.setOptiona(String.valueOf(onlyJava));
                        q.setOptionb(String.valueOf(java));
                        q.setOptionc(String.valueOf(onlyJava + 2));
                        q.setOptiond(String.valueOf(java + python));
                        q.setCorrectAnswer("A");
                    } else {
                        q.setQuestionText("Reasoning Scenario: All developers in " + nameA + "'s team are analysts. Some analysts are managers. No managers are part-time workers. Which of the following statements must be logically true?");
                        q.setOptiona("All analysts are developers.");
                        q.setOptionb("Some developers must be managers.");
                        q.setOptionc("No managers are part-time workers.");
                        q.setOptiond("All managers are analysts.");
                        q.setCorrectAnswer("B");
                    }
                }
                questionsPool.add(q);
            }
            questionRepository.saveAll(questionsPool);
            System.out.println("Seeded 600 scenario-based questions across 3 tests successfully.");

        } else {
            System.out.println("Database already contains " + questionRepository.count() + " partitioned questions.");
        }
    }

    private Test seedTest(Long testId, String name, String category, int duration, int totalMarks) {
        List<Test> allTests = testRepository.findAll();
        for (Test t : allTests) {
            if (name.equals(t.getTestName())) {
                return t;
            }
        }
        Test t = new Test();
        t.setTestName(name);
        t.setCategory(category);
        t.setDuration(duration);
        t.setTotalMarks(totalMarks);
        return testRepository.saveAndFlush(t);
    }




    private void seedUser(String email, String name, String rawPassword, String role, String rollNumber, String department) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setName(name);
            user.setRole(role);
            user.setRollNumber(rollNumber);
            user.setDepartment(department);
            userRepository.save(user);
            System.out.println("User updated: " + email + " with role: " + role + " (Password: " + rawPassword + ")");
        } else {
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setRollNumber(rollNumber);
            user.setDepartment(department);
            userRepository.save(user);
            System.out.println("User created: " + email + " with role: " + role + " (Password: " + rawPassword + ")");
        }
    }
}
