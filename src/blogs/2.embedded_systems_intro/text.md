<h1 id="intro-to-embedded-systems">Intro to Embedded Systems</h1>

This article is meant for people that are absolutely new to embedded systems.  
Here you will find an overview of the various concepts and straightforward directions about how to get started.

## Index

<div class="custom-index">
  <ul>
    <li class="index-section">
      <a href="#what-is-it">1. What's an Embedded System?</a>
      <ul class="index-subsection">
        <li><a href="#why-embedded">1.1 Why 'embedded'?</a></li>
      </ul>
    </li>
    <li class="index-section">
      <a href="#how-is-it-made">2. How is it made</a>
      <ul class="index-subsection">
        <li><a href="#hardware">2.1 Hardware</a>
          <ul class="index-subsection">
            <li><a href="#input-elements">2.1.1 Input Elements</a></li>
            <li><a href="#computational-unit">2.1.2 Computational Unit</a>
            <li><a href="#output-elements">2.1.3 Output Elements</a></li>
          </ul>
        </li>
        <li><a href="#firmware">2.2 Firmware</a></li>
        <li><a href="#software">2.3 Software</a></li>
      </ul>
    </li>
    <li class="index-section">
      <a href="#tools-of-the-trade">3. Tools of the trade</a>
      <ul class="index-subsection">
        <li><a href="#multimeter">3.1 Multimeter</a></li>
        <li><a href="#soldering-iron">3.2 Soldering Iron</a></li>
        <li><a href="#power-supply">3.3 Power Supply</a></li>
        <li><a href="#oscilloscope">3.4 Oscilloscope</a></li>
        <li><a href="#logic-analyzer">3.5 Logic Analyzer</a></li>
        <li><a href="#the-debugger">3.6 The debugger</a></li>
      </ul>
    </li>
    <li class="index-section">
      <a href="#how-to-get-started">4. How to get started</a>
      <ul class="index-subsection">
        <li><a href="#how-to-grow-meaningful-knowledge">4.1 How to grow meaningful knowledge</a></li>
        <li><a href="#learning-resources">4.2 Learning resources</a></li>
      </ul>
    </li>
    <li class="index-section">
      <a href="#closing-thoughts">5. Closing thoughts</a>
    </li>
  </ul>
</div>

<h1 id="what-is-it">1. What's an Embedded System?</h1>
Embedded Systems, <span tt="ES">ES</span> from now on, is an application field that merges computer science, electrical engineering and mechanical engineering to create electronic systems for specific use cases.

It's important to define the distinction between an <em>electrical</em> and an <em>electronic</em> system.

Electrical means anything where "current flows through wires", like motors, simple wirings and lighting.  
Electronic means anything where "current flows through active components that perform computation", like diodes, transistor and ultimately computers.

Not all computers are referred to as Embedded Systems though: any general purpose computer like desktop PCs, laptops or smartphones, is *not* an embedded system.

Some <span tt="ES">ES</span> examples are:
- <span tt="keyboard">computer keyboard</span>
- <span tt="wrist_clock">digital wrist clock</span>
- <span tt="ECU">the computer inside cars</span>
- <span tt="SAM_computer">the guidance system of a surface to air missile</span>

<h2 id="why-embedded">1.1 Why <em>'embedded'</em>?</h2>
The result of the engineer's work is the electronic system, which can't be handed to the customer as it is, it first needs to be integrated, e.g. embedded, in some kind of enclosure, hence the term embedded system.

For a desktop mouse, the enclosure is made of plastic, and for a surface to air missile the enclouse is made of metal.

<h1 id="how-is-it-made">2. How is it made</h1>

An embedded system is made of three main elements:

- <strong>Hardware</strong>: The electronics, like chips, buttons and actuators. 
- <strong>Firmware</strong>: Low-level code running on the ES hardware, controlling its delicate basic functionalities  
- <strong>Software</strong>: Higher-level code that runs on or communicates with the ES to implement extra functionalities

These three layers work together to create a functioning embedded system. The hardware provides the physical platform, the firmware controls it directly, and the software (when present) adds higher-level functionality.

The core of an <span tt="ES">ES</span> is the electronics. There can be an <span tt="ES">ES</span> without any software or mechanical engineering involved, but there can't be an <span tt="ES">ES</span> without electronics, i.e. an <span tt="ES">ES</span> is applied electronics.

The electronics is consolidated in a single assembly called <span tt="PCB">Printed Circuit Board</span> (PCB). A PCB is a flat board made of insulating material (usually fiberglass) with copper traces etched onto it that connect different electronic components together. Components like integrated circuits, resistors, capacitors, and connectors are soldered onto the board. The PCB is the physical heart of any embedded system, it's where all the magic happens. Without it, you'd have a mess of wires connecting components, which would be unreliable and impossible to manufacture at scale.

Consider a desktop mouse as an example: the hardware includes the circuit board with its buttons, scroll wheel, and motion sensor, the firmware is the code on the circuit board that interprets input from these components and sends data to the connected device and the software is the application running on your desktop computer that interacts with the mouse to adjust settings like DPI.

<h2 id="hardware">2.1 Hardware</h2>

Functionally speaking, all the hardware elements of an ES fall into one of three categories:

- <strong>input elements</strong>
- <strong>computational unit</strong>
- <strong>output elements</strong>

<h3 id="input-elements">2.1.1 Input Elements</h3>

Think of a button, dial, touch screen, a receiving antenna, magnetic sensor, light sensor, humidity sensor: anything that can produce electrical signals that describe the surrounding enviroment.

In the case of a desktop mouse, the input elements are the buttons, scroll wheel and motion sensor.

<h3 id="computational-unit">2.1.2 Computational Unit</h3>

This is the core of the system, this is where the actual computation is performed.

Computational Units, CUs from now on, are <span tt="IC">integrated circuits</span> that implement some kind of computer.

There are several different kinds of computational units, so let's start from something that most people are familiar with: your desktop PC.

The CU of dekstop PCs is called <strong>Central Processing Unit</strong> (CPU). The CPU is a general purpose computer, meaning that when it's turned on, it starts executing a list of instructions specified by a program, written by a programmer: the list of instructions determine what the CPU does, so if the instructions are changed, the CPU will do different things. The hardware remains the same, but it carries out different computations based on the instructions given (e.g. the software). This is not a trivial thing: considering that integrated circuits are machines, the bare fact that a general purpose machine is manufacturable makes it so that everyone can have a computer for their own needs at low cost: simply make 100 CPUs and program them differently. I cannot overstate how much this changed the world.

CPUs are chips that change what they do based on their programming. This flexibility is great, but it comes at a cost: speed. Following a list of instructions takes time, as the CPU needs to read the next instruction, see what that is, activate the part of the chip that does that, and then actually execute it. This is called the <em>Fetch-Decode-Execute</em> cycle: the CPU fetches the next instruction, decodes what it is, and then executes it.

In embedded systems, many different types of CPUs are used as the computational unit. The terminology can be confusing at first, as we use different names based on clock speed, core count, RAM size, available peripherals, etc. Here are the most common types you'll encounter, ordered from simplest to most complex:

- <strong>MCU (Microcontroller Unit)</strong>: A complete computer system on a single chip, including CPU, memory, and I/O peripherals. For example, the STM32F4.
- <strong>MPU (Microprocessor Unit)</strong>: A CPU on a single chip, typically without integrated memory or peripherals. For example, the Intel 8086.
- <strong>CPU (Central Processing Unit)</strong>: The general term for a processor. For example, the Intel Core i7.
- <strong>DSP (Digital Signal Processor)</strong>: A specialized processor optimized for digital signal processing operations like filtering, FFT, and audio/video processing. For example, Texas Instruments TMS320C6000.
- <strong>APU (Accelerated Processing Unit)</strong>: A processor that combines CPU and GPU on the same die. For example, AMD Ryzen with integrated graphics.
- <strong>SoC (System on Chip)</strong>: An integrated circuit that contains multiple components of a computer system, including CPU cores, GPU, memory controllers, and various peripherals. For example, the Raspberry Pi's BCM2711.

The Fetch-Decode-Execute cycle is less than ideal for applications where no decision making is needed and maximum speed is required. CPUs exist because when you give a computer to a person, you don't know what they will use it for, so we make it programmable via software. But what if we know exactly what the computer will be used for? What if we're willing to trade all the flexibility for maximum speed? This is needed in high-performance applications like digital signal processing, where the computation is already known and we can't afford to waste time fetching and decoding instructions.

We can achieve this with an <strong>Application Specific Integrated Circuit</strong> (ASIC).

ASICs come with significant trade-offs: development cost and inflexibility. Developing a chip is very expensive regardless of what it does, and making one for a narrow market makes it even more expensive, as it won't sell as many units. Moreover, once manufactured, the circuit cannot be changed: if there's a design error you are stuck with it. This is true for all ICs, but it's particularly painful for ASICs as they are, unlike CPUs, not configurable in any way. This makes ASICs economically viable only for markets where the high per-unit cost is acceptable, such as Bitcoin mining, high-speed networking equipment, or when manufacturing millions of units (like the chips in your phone).

What if we wanted the performance of ASICs with some computational flexibility? That's what FPGAs are for.

<strong>Field Programmable Gate Arrays</strong> (FPGAs) are integrated circuits that implement a matrix of logic blocks, each of which is configurable in the way it connects to the other blocks. A precise setup in how these blocks are connected allows different kinds of digital functions to be implemented, from a simple binary counter to a complex Fourier transform.

Any digital circuit can be implemented on an FPGA, granted that the FPGA has enough logic blocks to implement it. For example, you can configure an FPGA to be a CPU, which takes the name of a [softcore](https://en.wikipedia.org/wiki/Field-programmable_gate_array#Soft_core).

In terms of performance, FPGAs sit between CPUs and ASICs, but are generally much closer to ASICs. With an FPGA, the algorithm is implemented in hardware, which gives a significant speed advantage over CPUs. However, because FPGAs use a matrix of configurable logic blocks rather than fixed-purpose circuitry like an ASIC, they are usually less efficient in both speed and energy consumption compared to ASICs.

For a more detailed view of how such logic blocks are made, see [here](https://en.wikipedia.org/wiki/Field-programmable_gate_array#Logic_blocks).

Both CPUs and FPGAs are general purpose computational units, but it's important to highlight the difference in flexibility: CPUs are flexible because you can change what they do by changing the next instruction; FPGAs instead are flexible because you turn them off, change the fabric configuration, and then turn them back on.

When talking about CPUs we use the terms "software" and "programming". These can and are indeed used for FPGAs as well, but they mean totally different things. Let's be specific about what these terms mean for CPUs and FPGAs.

The software of CPUs is the list of machine instructions that the CPU executes. This list is obtained starting from a program, which is code written by a programmer in a programming language, like C/C++. This program gets compiled (translated) to machine code, a list of instructions that the CPU can understand and execute. The complete set of all possible valid CPU instructions is defined in the Instruction Set Architecture (<span tt="isa">ISA</span>) of the target CPU.

Programming a CPU means: writing a program, compiling it to machine code, placing that code in RAM where the CPU can access it, and setting the Instruction Pointer register of the CPU to the RAM address of the first instruction. From there, the CPU simply executes these instructions one by one, without caring about the overall outcome, it just follows orders.

The software of FPGAs is code written in a hardware description language, like Verilog, that gets translated to a bitstream and then used to set the logic blocks in the FPGA in order to implement a certain function.

Programming an FPGA means writing the HDL to implement something, compiling it to a bitstream and placing it in a memory inside or beside the FPGA that will be read at startup and used to set the logic blocks.

Calling HDL code "software" is quite a stretch, as the "soft" in software implies being straightforward to change and done so on a regular basis (think of how often you update apps on your phone), which is definitely not the case with FPGA code.

<h3 id="output-elements">2.1.3 Output Elements</h3>

Output elements are how the <span tt="ES">ES</span> talks back to you or to other systems.

Think of LEDs, displays (LCD, OLED, seven-segment, e-paper), buzzers, speakers, motors (DC, stepper, servo), relays, heating elements, and communication outputs like WiFi, Bluetooth.

In the case of a desktop mouse, the output of the system is the buttons and motion data encoded as USB or Bluetooth signals sent to the PC.

<h2 id="firmware">2.2 Firmware</h2>

Firmware is the code that runs directly on the computational unit (MCU, CPU, or FPGA), without an operating system in between. It's called firmware and not software because it's typically written once and remains mostly unchanged for the lifetime of the product. Think about how many times you updated your HVAC firmware, right, you never did.

Firmware is low-level code that directly controls the hardware: it configures registers, manages interrupts, handles timers, and interfaces with peripherals. There's no abstraction layer like you'd find in desktop applications. When you write firmware, you're programming the bare metal.

For example, the firmware in your computer keyboard reads which keys are pressed, debounces the switches, and sends the appropriate USB signals to your PC. It runs the same code every single time you press a key, without any operating system.

<h2 id="software">2.3 Software</h2>

In the embedded world, when we say "software" (as opposed to firmware), we're usually talking about higher-level code that runs on top of an operating system like Linux or Android. This is different from firmware in several ways:

- <strong>Abstraction level</strong>: Software uses operating system APIs and libraries rather than directly controlling hardware
- <strong>Update frequency</strong>: Software can get updated more frequently and more easily, as there is no need to know the intricacies of the hardware

For example, a Raspberry Pi running a web server to control your home automation is running software on Linux. The same Pi also has firmware to read data from the humidity and temperature sensor.

Modern embedded products often use both: firmware handles low level hardware facing functionalities (like reading sensors or controlling motors), while software handles user interfaces, network communication, and business logic.

An example is a modern bench power supply: the firmware precisely controls the voltage and current settings based on the front panel buttons and dials, while the software provides a web interface for remote control and configuration. You might update the software to add new features, but the firmware remains stable (unless a bug is found) as the front panel is always the same.

Note that code running on real-time operating systems like [FreeRTOS](https://en.wikipedia.org/wiki/FreeRTOS) and [Zephyr](https://en.wikipedia.org/wiki/Zephyr_(operating_system)) is still considered firmware, as these RTOSes are minimal and you're still programming close to the hardware, configuring registers and managing peripherals directly.

<h1 id="tools-of-the-trade">3. Tools of the trade</h1>

If you work in embedded systems, you cannot be scared of electronics. You'll be working directly with circuits, components, and electrical signals on a daily basis. Understanding how to safely handle, test, and debug electronic systems is fundamental to the job.

Having the right tools and knowing how to use them is just as important as knowing how to write code. While software engineers have their IDEs and debuggers, embedded systems engineers have their lab equipment. These tools allow you to see what's actually happening in your circuit by measuring voltages, observing signal waveforms, and diagnosing hardware issues that no amount of code inspection can reveal.

Let's go through the essential tools you'll need to get started.

<strong>Caution:</strong>  
If you have never handled electronics before, stick to low-energy components like cell batteries and LEDs.  
You can burn your house down or hurt
The best way to get started is having someone in person showing you the basics, but don't be afraid to try on your own.

<h2 id="multimeter">3.1 Multimeter</h2>

This is the first tool you should get acquainted with and is also the most basic lab tool.
A [multimeter](https://en.wikipedia.org/wiki/Multimeter) is, for the most part, a diagnostic tool. It can take voltage, current and resistance readings, so it's the tool you need to use first after learning about Ohm's Law.

Beware though, you can still break things and burn your house down by misusing a multimeter!

<h2 id="soldering-iron">3.2 Soldering Iron</h2>

An embedded system is made of many different components, which need to be joined electrically when assembling the system.
This is done with [solder](https://en.wikipedia.org/wiki/Solder), a metal alloy that melts around 180-300°C (depending on the lead content).
The melting temperature is low enough that soldering can be safely done at home with a simple (yet very dangerous if misused) tool called a soldering iron, basically a metal rod where the pointy end is heated via electric current.

Soldering is a fundamental skill in embedded systems. You'll use it to:

- Assemble prototype circuits on perfboard or PCBs
- Attach header pins to development boards
- Replace faulty components
- Make connections between wires and components
- Repair broken solder joints

The soldering iron heats both the component and the pad simultaneously, then you apply solder which melts and flows into the joint, creating both an electrical and mechanical connection. Good soldering technique takes practice, too little heat and the solder won't flow properly (creating a "cold joint"), too much heat and you can damage the component or lift the copper pad from the board.

Modern lead-free solder requires higher temperatures (around 300°C) compared to traditional leaded solder (around 230°C), but is safer for the environment and your health.

<h2 id="power-supply">3.3 Power Supply</h2>

Electronics need power to function. Some boards need 24 Volts, some need 5V, some need 3.3V. A bench [power supply](https://en.wikipedia.org/wiki/Power_supply) is a voltage and current source that can be set to specific values, allowing you to power your embedded system during development and testing.

Unlike wall adapters or USB power, a bench power supply gives you precise control over both voltage and current. This is crucial for embedded systems work because:

- You can set the exact voltage your circuit needs
- You can limit the maximum current to protect your circuit from damage in case of a short circuit
- You can monitor real-time power consumption
- You can quickly adjust voltage to test different operating conditions

<h2 id="oscilloscope">3.4 Oscilloscope</h2>

Using a multimeter you can verify the current voltage difference between two points, but what if you wanted to visualize how that voltage changes over time? This is where an [oscilloscope](https://en.wikipedia.org/wiki/Oscilloscope) comes in, it's a tool used to graph voltage over time.

An oscilloscope allows to perform:
- [<strong>Signal integrity</strong>](https://en.wikipedia.org/wiki/Signal_integrity): Check for noise, ringing, overshoot, or distortion on your signals
- <strong>Frequency measurement</strong>: See the actual frequency and duty cycle of clock signals or [PWM](https://en.wikipedia.org/wiki/Pulse-width_modulation) outputs
- <strong>Waveform analysis</strong>: Observe the shape of analog signals to ensure they match expectations

For example, a multimeter might show you that a signal is at 3.3V, but an oscilloscope will show you if that signal is actually switching between 0V and 3.3V at 1MHz, or if there's 500mV of noise on top of it, or if it has dangerous voltage spikes.

<h2 id="the-debugger">3.6 The programmer/debugger</h2>

In software engineering the debugger is a program that runs on the same machine where the debuggee is running.  
In embedded systems, the debugger is much more than a piece of software.

Imagine this situation.  
We write the code on our Desktop machine, and we need to move this code to the embedded system. How can we do that?
Our desktop machine only speaks USB and Ethernet, and indeed some <span tt="ES">ES</span>s can be flashed via those protocols, but what if they don't? We need something to bridge the gap.
We need a so called programmer, a piece of hardware that bridges the USB/Ethernet coming from the PC to whatever the <span tt="ES">ES</span> uses for flashing the internal memory.

Now the code is running on the <span tt="ES">ES</span>, but after a while it gets stuck. How can we debug this?

Embedded systems use two debugging protocols, [SWD and JTAG](https://en.wikipedia.org/wiki/JTAG).
The two serve the same code-debugging purpose, but JTAG also offers other advanced functionalities.

These two functions, programming and debugging, are usually combined in the same hardware device, usually called programmer or debugger.

On the PC side, we usually connect to the debugger via software like `gdb`.

<h1 id="how-to-get-started">4. How to get started</h1>

You are incredibly lucky: getting started with embedded systems has never been easier.
Knowledge is basically free thanks to the internet, writing software is free, and making hardware has never been cheaper, both mechanical and electrical.
Most low-cost prototyping services are from China, but some western alternatives are also available.

Embedded systems can be very diverse, but I think the best way to start is with a microcontroller development board.
A microcontroller is exactly the same as a desktop CPU, plus/minus some things, and you program it the same way: you write code in whatever language you want (usually C/C++/Rust/Assembly), you compile it and then use a debugger to flash it on the microcontroller.

There are a number of them available for cheap online, most commonly Arduino boards like the Uno and Micro.

The real difficulty is getting the basics down. Embedded Systems is very finicky and full of nuances that if not done correctly will make your project NOT work.
Either you do it right or it won't work, not for long at least.

Just like you can write a program that seems to work but crashes after 5 hours, you can build a circuit that seems to work but turns off after 2 hours.

The good news is that you will discover most of them by just studying the basics and doing very very simple projects.
Try to turn on an LED. If it's your first time, you can't do it. Lookup a tutorial and you will learn so much.

You don't know what you are doing anyway, so it's important to just start, not worry about where.
Go with:
- A beginner friendly development board (anyone will do, it's not important which)
- breadboard
- through-hole LEDs and resistors
- dupont wires (all genders)

<h2 id="how-to-grow-meaningful-knowledge">4.1 How to grow meaningful knowledge</h2>

Now that it is clear that any project will teach you a lot, we should try to focus our efforts.
Don't do random projects "just to learn", try to do projects that will teach you something that you actually intend to use.
Try to make projects that will yield meaningful results.

You need to create in order to learn: might as well create something that someone needs, right?
That way you will get the user-engineer feedback loop that is crucial to make products enjoyable to use. Without it, as soon as you see your project work you will think "It's done" and move onto something else.
Whereas putting it into the hands of a user will highlight several things that still need to be done

<h2 id="learning-resources">4.2 Learning resources</h2>

Here are some excellent resources organized by topic to help you dive deeper into embedded systems:

<strong>YouTube Channels & Video Content:</strong>
- [<strong>Philip Salmony</strong>](https://www.youtube.com/@PhilSalmony)'s PCB design and DSP theory videos: excellent for understanding signal processing and board design fundamentals
- [<strong>Dave Jones</strong>](https://www.youtube.com/@EEVblog)'s [<em>EEVblog</em>](https://www.eevblog.com/): comprehensive electronics theory videos covering everything from basic circuits to advanced measurement techniques
- [<strong>Shahriar Shahramian</strong>](https://www.youtube.com/@TheSignalPathBlog)'s [<em>The Signal Path</em>](https://thesignalpath.com/): metrology theory and teardowns of high-end test equipment
- [<strong>Ben Eater</strong>](https://www.youtube.com/@BenEater)'s channel: incredible step-by-step build videos showing how computers work from the ground up
- [<strong>Adam Taylor</strong>](https://www.linkedin.com/in/adam-taylor-fpga/)'s [<em>MicroZed Chronicles</em>](https://www.hackster.io/adam-taylor) blog: in-depth FPGA tutorials and design patterns

<strong>Online Communities:</strong>
- [r/embedded](https://www.reddit.com/r/embedded/) on Reddit: active community for questions and discussions 
- [Stack Overflow embedded tags](https://stackoverflow.com/questions/tagged/embedded): good for specific programming questions

<h2 id="closing-thoughts">5. Closing thoughts</h2>

At this point you must be thrilled to get started. Good.  
You are gonna build tech, earn good money and have high status. Good.  
However, engineering is not fun.  
It's fun once the project is finished and you see it working.  

This is just a heads up: if you really like this stuff, go for it, you have everything to gain, but it's gonna be rough.

When it comes to making projects for learning purposes, instead of just "trying out things", I strongly suggest to build things that are needed, either by you or someone else. Engineering thrives the most when there is a feedback loop from the user of the product to the engineer that built it. Nowadays, time to market is such a strong pressure on engineers that there is no time to get feedback from customers.

Also, please take a moment to realize the immense responsibility that lies on your shoulders.
Take a look around you: we are surrounded by wealth. All of this wealth was created by Humans using technology, technology that was built by engineers. We enable all of this wealth. People nowadays are better off than people of the past because they have technology, not because they are better than people from the past.

Moreover, doctors, lawyers and engineers are the typical professions that earn high money and status, but only engineers build careers on success alone.

Engineers have immense power in their hands, so try to seize it and use it for good.

Good luck.

---

## Gallery

<div class="image-grid">
  <img class="hover-effect click-zoom" src="es_1.jpg" alt="Gallery image 1" />
  <img class="hover-effect click-zoom" src="es_2.jpg" alt="My custom mouse assembly" />
  <img class="hover-effect click-zoom" src="es_3.jpg" alt="My custom keyboard internals" />
  <img class="hover-effect click-zoom" src="es_4.jpg" alt="Infrared seeker for an R-60 soviet air-to-air missile" />
  <img class="hover-effect click-zoom" src="es_5.jpg" alt="Gallery image 5" />
  <img class="hover-effect click-zoom" src="es_6.jpg" alt="Gallery image 6" />
</div>
