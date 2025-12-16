date: 2025-12-26
---

[   WRITING IN PROGRESS   ]

<h1 id="intro-to-embedded-systems">Embedded Systems Overview</h1>

This article is a conceptual overview of embedded systems, meant for people who are absolutely new to the field. Whether you're a student, a hobbyist, or a software developer curious about this field, here you will find high-level explanations to help you understand the fundamental concepts and terminology.

**What you'll learn:**
- What embedded systems are and where the term 'embedded' comes from
- What are the different elements of an embedded system
- Essential tools in an embedded systems engineer's toolbox
- Where to go next for hands-on learning

Let's dive in!

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
            <li><a href="#computational-unit">2.1.2 Computational Unit</a></li>
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
  </ul>
</div>

<h1 id="what-is-it">1. What's an Embedded System?</h1>
<div class="highlight-box">
Embedded Systems, (<span tt="ES">ES</span>), is an application field that merges computer science, electrical engineering and mechanical engineering to create <span tt="electronic">electronic</span> systems for <strong>specific</strong> use cases.
</div>

While all embedded systems are computers that perform computation, not all computers are embedded systems: general-purpose computers like desktop PCs, laptops, and smartphones are not considered embedded systems.

Some <span tt="ES">ES</span> examples are:
- <span tt="keyboard">computer keyboard</span>
- <span tt="wrist_clock">digital wrist clock</span>
- <span tt="ECU">the computer inside cars</span>
- <span tt="SAM_computer">the guidance system of a surface to air missile</span>

<h2 id="why-embedded">1.1 Why <em>'embedded'</em>?</h2>
Embedded Systems is basically applied electronics. Such electronics can't be handed to the customer as it is, it first needs to be integrated, e.g. embedded, in some kind of enclosure, hence the term embedded system.

<h1 id="how-is-it-made">2. How it is made</h1>
An embedded system is made of three main elements:

- <strong>Hardware</strong>: The electronics, like chips, buttons and actuators 
- <strong>Firmware</strong>: Low-level code running directly on the hardware, controlling its delicate basic functionalities 
- <strong>Software</strong>: Higher-level code that runs on or communicates with the ES to implement extra functionalities

The hardware provides the physical platform, the firmware controls it directly, and the software (when present) adds higher-level functionality.

Consider a desktop mouse as an example: the hardware includes the circuit board with its buttons, scroll wheel, and motion sensor, the firmware is the code on the circuit board that interprets input from these components and sends data to the desktop PC, and the software is the application running on your desktop PC that interacts with the mouse to adjust settings like DPI.

<h2 id="hardware">2.1 Hardware</h2>

The core of an <span tt="ES">ES</span> is the electronic hardware. There can be an <span tt="ES">ES</span> without any software or mechanical engineering involved, but there can't be an <span tt="ES">ES</span> without electronics, i.e. an <span tt="ES">ES</span> is applied electronics.

The electronics is consolidated in a single assembly called <span tt="PCB">Printed Circuit Board</span> (PCB). A PCB is a flat board made of alternating layers of insulating material (usually fiberglass) and copper, where the copper layers has been etched to leave behind only individual traces, which connect the different electronic components together. Components like integrated circuits, resistors, capacitors, and connectors are soldered onto the board. The PCB is the physical heart of any embedded system, it's where all the magic happens. Building electronics without PCBs would require a mess of wires connecting components, which would be unreliable and impossible to manufacture at scale.

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

There are several different kinds of computational units, so let's start from the one present in desktop PCs: the CPU.

<div class="highlight-box">
The <strong>Central Processing Unit</strong> (CPU) is an integrated circuit that implements a general-purpose computer. When turned on, it starts executing a list of instructions specified by a program. The hardware remains the same, but it carries out <span tt="cpu_non_triviality">different computations</span> based on the instructions given (e.g. the software).
</div>

In embedded systems, <span tt="cpu_types">many different types of CPUs</span> are used as the computational unit. The terminology can be confusing at first, as we use different names based on clock speed, core count, integrated RAM size and capabilities.

The flexibility that CPUs have comes at the cost of speed. Following a list of instructions takes time, as the CPU needs to read the next instruction, activate the part of the chip that does that, and then actually execute it. This is called the [<em>Fetch-Decode-Execute</em>](https://en.wikipedia.org/wiki/Instruction_cycle) cycle: the CPU fetches the next instruction, decodes it, and then executes it.

The F-D-E cycle is less than ideal for applications where no decision making is needed and maximum speed is required. What if we're willing to trade all the flexibility for maximum speed? The scenario we are talking about is high-performance applications like digital signal processing, where the computation is already known and we can't afford to waste time fetching and decoding instructions.

We can achieve this with an <strong>ASIC</strong>.

<div class="highlight-box">
The <strong>Application Specific Integrated Circuit</strong> (ASIC), is an integrated circuit that implement a fixed-purpose computer. When turned on, it will always do the same thing, as it's not configurable in anyway.
</div>

ASICs come with significant trade-offs: high development cost and inflexibility. Developing an IC is very expensive, regardless of what it does, and making one for a specific use case like ASICs, which usually target narrow markets, makes it even more expensive, as it won't sell as many units. Moreover, once manufactured, ICs cannot be changed: if there's a design error you are stuck with it. This is true for all ICs, but it's particularly painful for ASICs as they are, unlike CPUs, not configurable in any way. This makes ASICs economically viable only for markets where the high per-unit cost is acceptable, such as Bitcoin mining, high-speed networking equipment, military applications.

Talking about CPUs and ASICs, we have gone from extreme flexibility and low speed, to zero flexiblity and high-speed.  
What if we wanted the performance of ASICs with some computational flexibility? That's what FPGAs are for.

<div class="highlight-box">
<strong>Field Programmable Gate Arrays</strong> (FPGA) are integrated circuits that implement a matrix of <a href="https://en.wikipedia.org/wiki/Field-programmable_gate_array#Logic_blocks" target="_blank"> logic blocks</a>, each of which is configurable in the way it connects to the other blocks. This is done by providing a bitstream to the FPGA at startup time. A precise setup in how these blocks are connected allows different kinds of digital functions to be implemented directly in hardware, from a simple binary counter to a complex Fourier transform.
</div>

<span tt="softcore">Any digital circuit can be implemented on an FPGA</span>, granted that the FPGA has enough logic blocks to implement it.

In terms of performance, FPGAs sit between CPUs and ASICs, but much closer to ASICs. With an FPGA, the algorithm is implemented in hardware, which gives a significant speed advantage over CPUs. However, because FPGAs use a matrix of configurable logic blocks rather than fixed-purpose circuitry like an ASIC, they are usually less efficient in both speed and energy consumption compared to ASICs.

Both CPUs and FPGAs are general purpose computational units, but it's important to highlight the difference: CPUs get reconfigured at run-time by changing the next instruction, FPGAs instead, are reprogrammable at startup time by changing the bitstream.

When talking about CPUs we use the terms "software" and "programming". These can and are indeed used for FPGAs as well, but they mean totally different things. Let's be specific about what these terms mean for CPUs and FPGAs.

<ul>
  <li><strong>CPU software:</strong> The software of CPUs is the list of machine instructions that the CPU executes. This list is obtained starting from a program, which is code written by a programmer in a programming language, like C/C++. This program gets compiled (translated) to machine code, a list of instructions that the CPU can understand and execute. The complete set of all possible valid CPU instructions is defined in the Instruction Set Architecture (<span tt="isa">ISA</span>) of the target CPU.</li>
  <li><strong>FPGA software:</strong> The software of FPGAs is code written in a hardware description language, like Verilog, that gets translated to a bitstream and then used to set the logic blocks in the FPGA in order to implement a certain function.</li>
</ul>

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
