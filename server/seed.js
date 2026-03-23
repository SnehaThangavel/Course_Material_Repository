require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const UserProgress = require('./models/UserProgress');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI).then(async () => {
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await UserProgress.deleteMany({});
    console.log('Cleared existing data.');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const studentPassword = await bcrypt.hash('Student@123', salt);

    // Create Admin
    const admin = await User.create({
        name: 'Principal Administrator',
        email: 'admin@bitsathy.ac.in',
        password: adminPassword,
        role: 'admin',
        institute: 'Bannari Amman Institute of Technology',
        department: 'Administration',
    });

    console.log('Created Users: admin@bitsathy.ac.in');

    // ─────────────────────────────────────────────
    // 5 Programming Courses with Level Structures
    // ─────────────────────────────────────────────
    const courses = await Course.insertMany([

        // 1. C Programming
        {
            title: 'C Programming',
            courseCode: 'C-PROG-101',
            category: 'Programming',
            skillCategory: 'Software',
            level: 'Beginner',
            description: 'Master the fundamentals of C programming from basics to pointers and data structures.',
            coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
            isPublished: true,
            createdBy: admin._id,
            totalLevels: 6,
            levels: [
                {
                    levelNumber: 1,
                    levelTitle: 'C Programming Level - 1',
                    topics: [
                        { title: 'Variables', materials: [{ title: 'Variables in C', type: 'document', url: 'https://www.tutorialspoint.com/cprogramming/c_variables.htm' }] },
                        { title: 'Operators', materials: [{ title: 'C Operators Guide', type: 'pdf', url: 'https://example.com/c-operators.pdf' }] },
                        { title: 'Conditional Statements', materials: [{ title: 'if-else in C', type: 'youtube', url: 'https://youtube.com/watch?v=c-conditionals' }] },
                    ]
                },
                {
                    levelNumber: 2,
                    levelTitle: 'C Programming Level - 2',
                    topics: [
                        { title: 'Looping Statements', materials: [{ title: 'Loops in C', type: 'document', url: 'https://www.tutorialspoint.com/cprogramming/c_loops.htm' }] },
                        { title: "'break' Statement", materials: [{ title: 'break keyword', type: 'document', url: 'https://example.com/c-break.pdf' }] },
                        { title: "'continue' Statement", materials: [{ title: 'continue keyword', type: 'document', url: 'https://example.com/c-continue.pdf' }] },
                    ]
                },
                {
                    levelNumber: 3,
                    levelTitle: 'C Programming Level - 3A',
                    topics: [
                        { title: 'Arrays', materials: [{ title: 'Arrays in C', type: 'document', url: 'https://www.tutorialspoint.com/cprogramming/c_arrays.htm' }] },
                    ]
                },
                {
                    levelNumber: 4,
                    levelTitle: 'C Programming Level - 3B Written Test',
                    topics: [
                        { title: 'Conditional Statements Review', materials: [] },
                        { title: 'Loops, break and continue Statements', materials: [] },
                        { title: 'Arrays Review', materials: [] },
                    ]
                },
                {
                    levelNumber: 5,
                    levelTitle: 'C Programming Level - 4',
                    topics: [
                        { title: 'String and its operations', materials: [{ title: 'C Strings', type: 'document', url: 'https://www.tutorialspoint.com/cprogramming/c_strings.htm' }] },
                    ]
                },
                {
                    levelNumber: 6,
                    levelTitle: 'C Programming Level - 5',
                    topics: [
                        { title: 'Functions', materials: [{ title: 'Functions in C', type: 'document', url: 'https://www.tutorialspoint.com/cprogramming/c_functions.htm' }] },
                        { title: 'Recursive functions', materials: [{ title: 'Recursion in C', type: 'youtube', url: 'https://youtube.com/watch?v=c-recursion' }] },
                    ]
                },
                {
                    levelNumber: 7,
                    levelTitle: 'C Programming Level - 6',
                    topics: [
                        { title: 'Structures, enum, unions', materials: [{ title: 'Structures in C', type: 'document', url: 'https://www.tutorialspoint.com/cprogramming/c_structures.htm' }] },
                        { title: 'Pointers', materials: [{ title: 'Pointers in C', type: 'pdf', url: 'https://example.com/c-pointers.pdf' }] },
                    ]
                }
            ],
            sections: []
        },

        // 2. Java Programming
        {
            title: 'Java Programming',
            courseCode: 'JAVA-PROG-101',
            category: 'Programming',
            skillCategory: 'Software',
            level: 'Intermediate',
            description: 'Learn Java from variables and data types to object-oriented programming concepts.',
            coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
            isPublished: true,
            createdBy: admin._id,
            totalLevels: 3,
            levels: [
                {
                    levelNumber: 1,
                    levelTitle: 'Programming Java Level - 1',
                    topics: [
                        { title: 'Variables', materials: [{ title: 'Java Variables', type: 'document', url: 'https://www.tutorialspoint.com/java/java_variable_types.htm' }] },
                        { title: 'Data Types', materials: [{ title: 'Primitive Data Types', type: 'pdf', url: 'https://example.com/java-datatypes.pdf' }] },
                        { title: 'Operators', materials: [{ title: 'Java Operators', type: 'document', url: 'https://www.tutorialspoint.com/java/java_basic_operators.htm' }] },
                        { title: 'Conditional Statements', materials: [{ title: 'if-else & switch', type: 'youtube', url: 'https://youtube.com/watch?v=java-conditions' }] },
                    ]
                },
                {
                    levelNumber: 2,
                    levelTitle: 'Programming Java Level - 2',
                    topics: [
                        { title: 'Type Conversion', materials: [{ title: 'Type Casting in Java', type: 'document', url: 'https://www.tutorialspoint.com/java/java_type_conversion.htm' }] },
                        { title: 'Loops', materials: [{ title: 'Loops in Java', type: 'youtube', url: 'https://youtube.com/watch?v=java-loops' }] },
                        { title: 'Arrays', materials: [{ title: 'Java Arrays', type: 'document', url: 'https://www.tutorialspoint.com/java/java_arrays.htm' }] },
                    ]
                },
                {
                    levelNumber: 3,
                    levelTitle: 'Programming Java Level - 3',
                    topics: [
                        { title: 'Classes, Objects, Methods, Constructors, Access Modifiers', materials: [{ title: 'Java OOP Basics', type: 'pdf', url: 'https://example.com/java-oop.pdf' }] },
                        { title: 'Strings, string Methods, string buffer and string builder, final keyword', materials: [{ title: 'Java String API', type: 'document', url: 'https://www.tutorialspoint.com/java/java_strings.htm' }] },
                    ]
                }
            ],
            sections: []
        },

        // 3. Python Programming
        {
            title: 'Python Programming',
            courseCode: 'PYTHON-PROG-101',
            category: 'Programming',
            skillCategory: 'Software',
            level: 'Beginner',
            description: 'Complete Python programming course from basics to object-oriented programming.',
            coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
            isPublished: true,
            createdBy: admin._id,
            totalLevels: 5,
            levels: [
                {
                    levelNumber: 1,
                    levelTitle: 'Programming Python Level - 1',
                    topics: [
                        { title: 'Variables', materials: [{ title: 'Python Variables', type: 'document', url: 'https://www.tutorialspoint.com/python/python_variable_types.htm' }] },
                        { title: 'Operators', materials: [{ title: 'Python Operators', type: 'document', url: 'https://www.tutorialspoint.com/python/python_basic_operators.htm' }] },
                        { title: 'Conditional Statements', materials: [{ title: 'if-elif-else', type: 'youtube', url: 'https://youtube.com/watch?v=python-conditions' }] },
                    ]
                },
                {
                    levelNumber: 2,
                    levelTitle: 'Programming Python Level - 2',
                    topics: [
                        { title: 'Looping Statements', materials: [{ title: 'for and while loops', type: 'document', url: 'https://www.tutorialspoint.com/python/python_loops.htm' }] },
                        { title: 'Break and Continue statements', materials: [{ title: 'Loop control', type: 'pdf', url: 'https://example.com/python-loops.pdf' }] },
                    ]
                },
                {
                    levelNumber: 3,
                    levelTitle: 'Programming Python Level - 3',
                    topics: [
                        { title: 'Tuples', materials: [{ title: 'Python Tuples', type: 'document', url: 'https://www.tutorialspoint.com/python/python_tuples.htm' }] },
                        { title: 'Sets', materials: [{ title: 'Python Sets', type: 'document', url: 'https://www.tutorialspoint.com/python/python_sets.htm' }] },
                        { title: 'Dictionaries', materials: [{ title: 'Python Dictionaries', type: 'document', url: 'https://www.tutorialspoint.com/python/python_dictionary.htm' }] },
                        { title: 'String Manipulation', materials: [{ title: 'String methods', type: 'youtube', url: 'https://youtube.com/watch?v=python-strings' }] },
                    ]
                },
                {
                    levelNumber: 4,
                    levelTitle: 'Programming Python Level - 4',
                    topics: [
                        { title: 'Defining and Calling Functions', materials: [{ title: 'Python Functions', type: 'document', url: 'https://www.tutorialspoint.com/python/python_functions.htm' }] },
                        { title: 'Understanding Parameters and Return Values', materials: [{ title: 'Parameters Guide', type: 'pdf', url: 'https://example.com/python-functions.pdf' }] },
                        { title: 'Recursion', materials: [{ title: 'Recursive functions in Python', type: 'youtube', url: 'https://youtube.com/watch?v=python-recursion' }] },
                    ]
                },
                {
                    levelNumber: 5,
                    levelTitle: 'Programming Python Level - 5',
                    topics: [
                        { title: 'OOPS: Classes and Objects', materials: [{ title: 'Python Classes', type: 'document', url: 'https://www.tutorialspoint.com/python/python_classes_objects.htm' }] },
                        { title: 'Inheritance and Polymorphism', materials: [{ title: 'Python Inheritance', type: 'pdf', url: 'https://example.com/python-inheritance.pdf' }] },
                        { title: 'Basic Class Methods', materials: [] },
                        { title: 'Encapsulation', materials: [{ title: 'Encapsulation in Python', type: 'youtube', url: 'https://youtube.com/watch?v=python-encapsulation' }] },
                    ]
                }
            ],
            sections: []
        },

        // 4. C++ Programming
        {
            title: 'C++ Programming',
            courseCode: 'CPP-PROG-101',
            category: 'Programming',
            skillCategory: 'Software',
            level: 'Intermediate',
            description: 'Learn C++ from basics to advanced topics including templates and STL.',
            coverImage: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
            isPublished: true,
            createdBy: admin._id,
            totalLevels: 3,
            levels: [
                {
                    levelNumber: 1,
                    levelTitle: 'Programming C++ Level - 1',
                    topics: [
                        { title: 'Basics - Variables', materials: [{ title: 'C++ Variables', type: 'document', url: 'https://www.tutorialspoint.com/cplusplus/cpp_variable_types.htm' }] },
                        { title: 'User Input', materials: [{ title: 'cin and cout', type: 'youtube', url: 'https://youtube.com/watch?v=cpp-input' }] },
                        { title: 'Data Types, Operators, Conditions', materials: [{ title: 'C++ Basics', type: 'pdf', url: 'https://example.com/cpp-basics.pdf' }] },
                    ]
                },
                {
                    levelNumber: 2,
                    levelTitle: 'Programming C++ Level - 2',
                    topics: [
                        { title: 'Control Flow Statements', materials: [] },
                        { title: 'while loop', materials: [] },
                        { title: 'for loop', materials: [{ title: 'for loops in C++', type: 'youtube', url: 'https://youtube.com/watch?v=cpp-for' }] },
                        { title: 'do-while loop', materials: [] },
                        { title: 'break/continue', materials: [] },
                        { title: 'Boolean', materials: [] },
                        { title: 'Switch case', materials: [{ title: 'Switch Statement', type: 'document', url: 'https://www.tutorialspoint.com/cplusplus/cpp_switch.htm' }] },
                    ]
                },
                {
                    levelNumber: 3,
                    levelTitle: 'Programming C++ Level - 3',
                    topics: [
                        { title: 'Arrays', materials: [{ title: 'C++ Arrays', type: 'document', url: 'https://www.tutorialspoint.com/cplusplus/cpp_arrays.htm' }] },
                        { title: 'Strings', materials: [{ title: 'C++ String', type: 'pdf', url: 'https://example.com/cpp-strings.pdf' }] },
                    ]
                }
            ],
            sections: []
        },

        // 5. Data Structures with Java
        {
            title: 'Data Structures with Java',
            courseCode: 'DSA-JAVA-101',
            category: 'Computer Science',
            skillCategory: 'Software',
            level: 'Advanced',
            description: 'Comprehensive study of data structures implemented in Java including arrays, linked lists, trees, and graphs.',
            coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
            isPublished: true,
            createdBy: admin._id,
            totalLevels: 1,
            levels: [
                {
                    levelNumber: 1,
                    levelTitle: 'Data Structure using Java - Level 1',
                    topics: [
                        { title: 'Arrays - Sorting Searching', materials: [{ title: 'Array algorithms', type: 'document', url: 'https://www.tutorialspoint.com/data_structures_algorithms/array_data_structure.htm' }] },
                        { title: 'Linear, Binary, Dynamic Arrays, Multidimensional Arrays', materials: [{ title: 'Array Types', type: 'pdf', url: 'https://example.com/dsa-arrays.pdf' }] },
                    ]
                }
            ],
            sections: []
        },

        // 6. Aptitude
        {
            title: 'Aptitude',
            courseCode: 'APT-101',
            category: 'General',
            skillCategory: 'General',
            level: 'Beginner',
            description: 'Comprehensive aptitude training covering quantitative, logical, and verbal reasoning.',
            coverImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80',
            isPublished: true,
            createdBy: admin._id,
            totalLevels: 9,
            levels: [
                {
                    levelNumber: 1,
                    levelTitle: 'Aptitude Level - 1A',
                    topics: [
                        { title: 'Number System', materials: [{ title: 'Number System Notes', type: 'document', url: 'https://example.com' }] },
                        { title: 'Ratio Proportion', materials: [{ title: 'Ratio Proportion Notes', type: 'document', url: 'https://example.com' }] }
                    ]
                },
                {
                    levelNumber: 2,
                    levelTitle: 'Aptitude Level - 1B',
                    topics: [
                        { title: 'Alligation & Mixtures', materials: [{ title: 'Alligation & Mixtures Notes', type: 'document', url: 'https://example.com' }] },
                        { title: 'Partnership', materials: [{ title: 'Partnership Notes', type: 'document', url: 'https://example.com' }] }
                    ]
                },
                {
                    levelNumber: 3,
                    levelTitle: 'Aptitude Level - 1C',
                    topics: [
                        { title: 'Percentage', materials: [{ title: 'Percentage Notes', type: 'document', url: 'https://example.com' }] },
                        { title: 'Profit Loss', materials: [{ title: 'Profit Loss Notes', type: 'document', url: 'https://example.com' }] }
                    ]
                },
                {
                    levelNumber: 4,
                    levelTitle: 'Aptitude Level - 1D',
                    topics: [
                        { title: 'Time & Work', materials: [{ title: 'Time & Work Notes', type: 'document', url: 'https://example.com' }] },
                        { title: 'Pipes & Cisterns', materials: [{ title: 'Pipes & Cisterns Notes', type: 'document', url: 'https://example.com' }] }
                    ]
                },
                {
                    levelNumber: 5,
                    levelTitle: 'Aptitude Level - 1E',
                    topics: [
                        { title: 'Averages', materials: [{ title: 'Averages Notes', type: 'document', url: 'https://example.com' }] },
                        { title: 'SI and CI', materials: [{ title: 'SI and CI Notes', type: 'document', url: 'https://example.com' }] }
                    ]
                },
                {
                    levelNumber: 6,
                    levelTitle: 'Aptitude Level - 1F',
                    topics: [
                        { title: 'Time Speed and Distance', materials: [{ title: 'TSD Notes', type: 'document', url: 'https://example.com' }] },
                        { title: 'Problems on Trains', materials: [{ title: 'Trains Notes', type: 'document', url: 'https://example.com' }] },
                        { title: 'Boats and Streams', materials: [{ title: 'Boats Notes', type: 'document', url: 'https://example.com' }] }
                    ]
                },
                {
                    levelNumber: 7,
                    levelTitle: 'Aptitude Level - 1G',
                    topics: [
                        { title: 'Permutation, Combination & Probability', materials: [{ title: 'P&C Notes', type: 'document', url: 'https://example.com' }] }
                    ]
                },
                {
                    levelNumber: 8,
                    levelTitle: 'Aptitude Level - 1H',
                    topics: [
                        { title: 'Ages & Calendar', materials: [{ title: 'Ages & Calendar Notes', type: 'document', url: 'https://example.com' }] }
                    ]
                },
                {
                    levelNumber: 9,
                    levelTitle: 'Aptitude Level - 1I',
                    topics: [
                        { title: 'Clocks & Directions', materials: [{ title: 'Clocks Notes', type: 'document', url: 'https://example.com' }] }
                    ]
                }
            ],
            sections: []
        },

        // 7. Analog Electronics
        {
            title: 'Analog Electronics',
            courseCode: 'ANA-ELE-101',
            category: 'Electronics',
            skillCategory: 'Hardware',
            level: 'Beginner',
            description: 'Fundamental concepts of analog electronics and circuit design.',
            coverImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80',
            isPublished: true,
            createdBy: admin._id,
            totalLevels: 4,
            levels: [
                {
                    levelNumber: 1,
                    levelTitle: 'Analog Electronics Level - 1A',
                    topics: [{ title: 'Selection of Current Liming Resistors using basic Circuit Laws', materials: [{ title: 'Circuit Laws', type: 'pdf', url: 'https://example.com' }] }]
                },
                {
                    levelNumber: 2,
                    levelTitle: 'Analog Electronics Level - 1B',
                    topics: [{ title: 'Implementation of Current Division, Voltage Division and Balancing Circuits', materials: [{ title: 'Division Circuits', type: 'document', url: 'https://example.com' }] }]
                },
                {
                    levelNumber: 3,
                    levelTitle: 'Analog Electronics Level - 1C',
                    topics: [{ title: 'Implementation of PN Junction and Zener Diode Circuits', materials: [{ title: 'Diodes', type: 'youtube', url: 'https://youtube.com' }] }]
                },
                {
                    levelNumber: 4,
                    levelTitle: 'Analog Electronics Level - 1D',
                    topics: [{ title: 'Implementation of DC Regulated Power Supply Circuit', materials: [{ title: 'Power Supply', type: 'pdf', url: 'https://example.com' }] }]
                }
            ],
            sections: []
        },

        // 8. Communication
        {
            title: 'Communication',
            courseCode: 'COMM-101',
            category: 'General',
            skillCategory: 'General',
            level: 'Beginner',
            description: 'Essential communication skills including reading, listening, and email etiquette.',
            coverImage: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
            isPublished: true,
            createdBy: admin._id,
            totalLevels: 3,
            levels: [
                {
                    levelNumber: 1,
                    levelTitle: 'Communication Level - 1A - Reading',
                    topics: [{ title: 'Reading', materials: [{ title: 'Reading Comprehension', type: 'document', url: 'https://example.com' }] }]
                },
                {
                    levelNumber: 2,
                    levelTitle: 'Communication Level - 1B - Listening',
                    topics: [{ title: 'Listening', materials: [{ title: 'Active Listening', type: 'youtube', url: 'https://youtube.com' }] }]
                },
                {
                    levelNumber: 3,
                    levelTitle: 'Communication - 1C - Email Etiquette',
                    topics: [{ title: 'Email Etiquette', materials: [{ title: 'Writing Professional Emails', type: 'pdf', url: 'https://example.com' }] }]
                }
            ],
            sections: []
        },

        // 9. Hardware : Digital Electronics
        {
            title: 'Hardware : Digital Electronics',
            courseCode: 'DIG-ELE-101',
            category: 'Electronics',
            skillCategory: 'Hardware',
            level: 'Intermediate',
            description: 'Comprehensive digital electronics course from basic logic to multistage arithmetic circuits.',
            coverImage: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&q=80',
            isPublished: true,
            createdBy: admin._id,
            totalLevels: 6,
            levels: [
                {
                    levelNumber: 1,
                    levelTitle: 'Electronics Level - 0',
                    topics: [
                        { title: 'Current and Voltage', materials: [{ title: 'Basics of Current', type: 'document', url: 'https://example.com' }] },
                        { title: 'Passive Devices', materials: [{ title: 'Passive Devices Overview', type: 'pdf', url: 'https://example.com' }] },
                        { title: 'Semiconductor devices', materials: [{ title: 'Semiconductors', type: 'youtube', url: 'https://youtube.com' }] },
                        { title: 'Digital Fundamental', materials: [{ title: 'Digital Fundamentals', type: 'document', url: 'https://example.com' }] },
                        { title: 'Combinational Circuits', materials: [{ title: 'Combinational Logic', type: 'pdf', url: 'https://example.com' }] }
                    ]
                },
                {
                    levelNumber: 2,
                    levelTitle: 'Digital Electronics Level - 1',
                    topics: [{ title: 'Implementation of Logic Functions using Switches, Resistors and LED', materials: [{ title: 'Logic Implementation', type: 'document', url: 'https://example.com' }] }]
                },
                {
                    levelNumber: 3,
                    levelTitle: 'Digital Electronics Level - 2',
                    topics: [{ title: 'Implementation of Logic Functions using 74 Series Logic ICs', materials: [{ title: '74 Series ICs', type: 'pdf', url: 'https://example.com' }] }]
                },
                {
                    levelNumber: 4,
                    levelTitle: 'Digital Electronics Level - 3',
                    topics: [{ title: 'Implementation of Logic Functions using Universal Logic Gates', materials: [{ title: 'Universal Gates', type: 'document', url: 'https://example.com' }] }]
                },
                {
                    levelNumber: 5,
                    levelTitle: 'Digital Electronics Level - 4',
                    topics: [{ title: 'Implementation of Logic Functions using Logic ICs for the given Truth Table', materials: [{ title: 'Truth Tables', type: 'youtube', url: 'https://youtube.com' }] }]
                },
                {
                    levelNumber: 6,
                    levelTitle: 'Digital Electronics Level - 5',
                    topics: [{ title: 'Implementation of Multistage Arithmetic Circuits using Logic ICs', materials: [{ title: 'Arithmetic Circuits', type: 'document', url: 'https://example.com' }] }]
                }
            ],
            sections: []
        }
    ]);

    console.log(`Created ${courses.length} programming courses.`);

    // Enroll students with level-based enrollments (None by default)
    const enrollmentData = [];
    await Enrollment.insertMany(enrollmentData);

    // Create UserProgress records for completed levels (None by default)
    const progressData = [];
    await UserProgress.insertMany(progressData);

    console.log('Created enrollments and user progress records.');
    console.log('\n✅ Seeding complete!');
    console.log('Credentials:');
    console.log('  Admin:    admin@bitsathy.ac.in    / Admin@123');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
