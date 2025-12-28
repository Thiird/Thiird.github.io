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
            <li><a href="#input-elements">2.1.1 Input Components</a></li>
            <li><a href="#computational-unit">2.1.2 Computational Unit</a></li>
            <li><a href="#output-elements">2.1.3 Output Components</a></li>
            <li><a href="#support-components">2.1.4 Support Components</a></li>
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
Embedded Systems (<span tt="ES">ES</span>), is an application field that merges computer science, electrical engineering and mechanical engineering to create <span tt="electronic">electronic</span> systems for <strong>specific</strong> use cases.
</div>

While all embedded systems are computers, not all computers are embedded systems: general-purpose computers like desktop PCs, laptops, and smartphones are not considered embedded systems.

Some <span tt="ES">ES</span> examples are:
- <span tt="awareness_keyboard">computer keyboard</span>
- <span tt="casio_watch">digital wrist clock</span>
- <span tt="ecu">the computer inside cars</span>
- <span tt="soviet_seeker">the infrared seeker of an air-to-air missile</span>

<h2 id="why-embedded">1.1 Why <em>'embedded'</em>?</h2>
Embedded Systems is basically applied electronics. Such electronics can't be handed to the customer as it is, it first needs to be integrated, e.g. embedded, <span tt="embedded">in some kind of enclosure</span>, hence the term embedded system.

<h1 id="how-is-it-made">2. How is it made</h1>
An embedded system is made of three main elements:

- <strong>Hardware</strong>: The electronics and the mechanical components 
- <strong>Firmware</strong>: Low-level code running directly on the hardware, controlling its basic functionalities 
- <strong>Software</strong>: Higher-level code that runs on or communicates with the <span tt="ES">ES</span> to implement higher-level functionalities

The hardware provides the physical platform, the firmware controls it directly, and the software (when present) adds higher-level functionality.

Consider a desktop mouse as an example: the hardware is the circuit board with its buttons, scroll wheel, and motion sensor, the firmware is the code that runs on the circuit board, interpreting the signals from these components and sending them off the device, and the software is, for example, the application running on your desktop PC that allows the user to adjust the mouse sensitivity. All is left to do is to design a plastic enclosure in which to embed the circuit board into, so that the user can easily and comfortably operate the mouse.

<h2 id="hardware">2.1 Hardware</h2>

The core of an <span tt="ES">ES</span> is the electronic hardware.

The electronics is consolidated in a single assembly called <span tt="PCB">Printed Circuit Board</span> (PCB). A PCB it's an assembly made of alternating layers of insulating material (usually fiberglass) and copper, where the copper layers has been precisely etched/milled to leave behind only individual traces, which connect the different electronic components together. Traces on different layers are connected with <span tt="vias">vias</span>. Components like integrated circuits, <span tt="resistors">resistors</span>, <span tt="capacitors">capacitors</span>, and <span tt="connectors">connectors</span> are [soldered](#soldering-iron) onto the traces to wire them together.  

The PCB is the physical heart of any embedded system, it's where all the magic happens. Building electronics without PCBs would require a mess of wires connecting components, which would make it impossible to automate the production process for mass production.

Functionally speaking, the components on a PCB fall into one of four categories:

- <strong>input components</strong>
- <strong>computational unit</strong>
- <strong>output components</strong>
- <strong>support components</strong>

<h3 id="input-elements">2.1.1 Input Components</h3>

Think of a button, dial, touch screen, a receiving antenna, magnetic sensor, light sensor, humidity sensor: anything that can produce electrical signals that describe the surrounding environment.

All of these devices are connected, either directly or [through intermediate circuitry](#support-components), to the computational unit.

In the case of a desktop mouse, the input components are the buttons, scroll wheel and motion sensor.

<h3 id="computational-unit">2.1.2 Computational Unit</h3>

This is the core of the system, this is where the actual computation is performed.

Computational Units, <span tt="CU">CU</span>s from now on, are <span tt="IC">integrated circuits</span> that implement some kind of computer.

There are several different kinds of computational units, so let's start from the one present in desktop PCs: the CPU.

<div class="highlight-box">
The <strong>Central Processing Unit</strong> (CPU) is an integrated circuit that implements a computer capable of performing a fixed number of operations. These operations are called <strong>machine instructions</strong>. Once turned on, the CPU starts executing the machine instructions specified in a program, which is a finite list of machine instructions. The set of all valid machine instructions that a program can use, is defined in the <strong>Instruction Set Architecture</strong> (<span tt="isa">ISA</span>) of the CPU. Changing the program changes what the CPU does, which <span tt="cpu_non_triviality">makes the CPU a general-purpose computer</span>.
</div>

In embedded systems, <span tt="cpu_types">many different types of CPUs</span> are used as the computational unit. The terminology can be confusing at first, as we use different names based on clock speed, core count, integrated RAM size and capabilities.

The flexibility that CPUs have comes at the cost of speed. Following a list of instructions takes time, as the CPU needs to read the next instruction, activate the part of the chip that does that, and then actually execute it. This is called the [<em>Fetch-Decode-Execute</em>](https://en.wikipedia.org/wiki/Instruction_cycle) cycle: the CPU fetches the next instruction, decodes it, and then executes it.

The F-D-E cycle is less than ideal for applications where the computation to be performed is 'already known' and maximum speed is required. Think of high-performance applications like <span tt="dsp_example">digital signal processing</span>, where we can't waste time fetching and decoding instructions. What we need in those cases, is to trade all the flexibility for all the speed.

We can achieve this with an <strong>ASIC</strong>.

<div class="highlight-box">
The <strong>Application Specific Integrated Circuit</strong> (ASIC), is an integrated circuit that implements a fixed-purpose computer. When turned on, it will always execute the same computation, as it's not configurable in anyway.
</div>

ASICs come with significant trade-offs: high development cost and inflexibility. Developing an IC is very expensive, regardless of what it does, and making one for a specific use case, like ASICs are, makes it even more expensive, as the narrow markets will result in fewer units sold. Moreover, once manufactured, ICs cannot be changed: if there's a design error you are stuck with it. This is true for all ICs, but it's particularly painful for ASICs as they are, unlike CPUs, not configurable in any way. This makes ASICs economically viable only for markets where performance comes before cost, like military applications.

Talking about CPUs and ASICs, we have gone from extreme flexibility and low speed, to zero flexibility and high-speed.  
What if we wanted the performance of ASICs with some computational flexibility? That's what FPGAs are for.

<div class="highlight-box">
A <strong>Field-Programmable Gate Array</strong> (FPGA) is an integrated circuit containing an array of <a href="https://en.wikipedia.org/wiki/Logic_block" target="_blank">configurable logic blocks</a> (CLBs). Each block can be configured in both the <span tt="logic_block_details">logical function</span> it performs and how it connects with the other blocks. At startup, the FPGA loads a <a href="#fpga-software">bitstream</a> that precisely defines the function of each block and its routing, enabling virtually any digital circuit to be realized directly in hardware.
</div>

<span tt="softcore">Any digital circuit can be implemented on an FPGA</span>, from a simple binary counter to a complex Fourier transform.

In terms of performance, FPGAs sit between CPUs and ASICs but much closer to ASICs. With an FPGA, algorithms run directly in  hardware, providing massive speedups over CPU execution. However, due to the overhead of configurable (rather than fixed) circuitry, FPGAs are typically less efficient in speed and power than ASICs.

Modern FPGA chips integrate far more than just the CLBs matrix, like dedicated RAM blocks, and high-speed I/O transceivers.

It is also common to integrate a CPU and an FPGA on the same die, so that the CPU can run an OS like Linux while offloading compute-intensive operations, like image processing or cryptography, to the FPGA for acceleration.

Both CPUs and FPGAs are general-purpose computational devices, but the key difference lies in how they can be reprogrammed: CPUs dynamically select the next instruction at runtime, while FPGAs are reconfigured at startup via a new bitstream.

When discussing CPUs, we use terms like "software" and "programming", which are also used with FPGAs, but they mean very different things:

<ul>
  <li id="cpu-software"><strong>CPU software:</strong> The software of CPUs is the list of machine instructions that the CPU executes. This list is obtained starting from a program, which is code written by a programmer in a programming language, like C or C++. This program gets <strong>compiled</strong> (translated) to machine code, a list of instructions that the CPU can understand and execute.</li>
  <li id="fpga-software"><strong>FPGA software:</strong> The software of FPGAs is code written in a <a href="https://en.wikipedia.org/wiki/Hardware_description_language" target="_blank">Hardware Description Language</a> (HDL), like Verilog or VHDL, that gets <strong>synthesized</strong> to a bitstream and then used to configure the CLBs in the FPGA to implement a certain function. The resulting bitstream depends on the input HDL code, <span tt="target_fpga_model">the target FPGA model</span>, and <span tt="synthesis_toolchain">the synthesis toolchain used</span>.</li>
</ul>

<h3 id="output-elements">2.1.3 Output Components</h3>

Output elements are how the <span tt="ES">ES</span> talks back to you or to other systems.

Think of LEDs, displays (LCD, OLED, seven-segment, e-paper), buzzers, speakers, motors (DC, stepper, servo), relays, heating elements, and communication outputs like WiFi, Bluetooth.

All of these devices are controlled, either directly or [through intermediate circuitry](#support-components), by the <span tt="CU">CU</span>.

In the case of a desktop mouse, the output of the system is the buttons and motion data encoded as USB or Bluetooth packets sent to whatever the mouse is connected to.

<h3 id="support-components">2.1.4 Support Components</h3>

Support components don't directly participate in sensing, computing, or actuating, but provide the necessary electrical environment for the system to [power on](#voltage-regulators), [function properly](#passive-components) and [maintain reliability](#protection-circuits) across all intended operating conditions.

These include:

- <strong id="voltage-regulators">Voltage regulators:</strong> they convert whatever input voltage you have to the specific voltages required by different parts of the circuit.
- <strong id="passive-components">Passive components:</strong> <span tt="resistors">resistors</span>, <span tt="capacitors">capacitors</span>, and inductors that filter noise and set timing constants.
- <strong id="protection-circuits">Protection circuits:</strong> <span tt="ESD_protection">ESD protection</span>, <span tt="reverse_polarity_protection">reverse polarity protection</span>, <span tt="overcurrent_protection">overcurrent protection</span>  

<h2 id="firmware">2.2 Firmware</h2>

Firmware is the low-level code that runs on the CU and directly controls the hardware: it configures registers, handles interrupts, manages timers, and interfaces with peripherals.

It's called <em>firm</em> and not <em>soft</em>(ware) because <span tt="firmware_unchanged">it's typically written once and remains mostly unchanged for the lifetime of the product</span>.

Firmware programming is mostly characterized by the absence of an operating system. The absence of an abstraction layer between the code and its effect is called <em>bare metal</em> programming, <span tt="bare_metal_example">as single lines of code result in measurable changes in reality.</span> This is not always the case. Modern embedded systems can be quite complicated, both in the <span tt="hardware_capabilities">hardware capabilities</span> and the <span tt="system_logic">logic of the system</span>, so a minimal operating system can be used to aid the programmer in managing the system. These operative systems provide minimal abstraction over the hardware, allowing the programmer to make full and efficient use of the capabilities of the system by using constructs like threads and work queues.

Some examples of such operative systems are <a href="https://www.freertos.org/" target="_blank">FreeRTOS</a> and <a href="https://www.zephyrproject.org/" target="_blank">Zephyr</a>.

<h2 id="software">2.3 Software</h2>

In the embedded world, we use the term <em>software</em> to refer to both the high-level code running <em>on-device</em>, on top of a full fledged operative system like Linux or Android, and the code running <em>off-device</em> that interacts with the embedded device.

In particular, we refer to the former as <em>embedded software</em> and the latter as just <em>software</em>.

Embedded software is about <em>on-device</em>, user-space application development and the system programming required to support those.

Software is about <em>off-device</em> code that adds extra functionality to the device, and it's often about making it easier to interact with it.

All of this is different from firmware, as software uses operating system APIs and libraries rather than directly controlling hardware to provide high-level functionalities. Also, being applications running in an operative system, software is much easier to update, as a simple change of the executable file is often the only thing needed.

<span tt="bench_power_supply_example">Complex embedded products use both</span>: firmware handles low level hardware functionalities (like reading sensors or controlling motors), while software handles the user-level applications, like graphical interfaces and networking.

Note that code running on real-time operating systems like [FreeRTOS](https://en.wikipedia.org/wiki/FreeRTOS) and [Zephyr](https://en.wikipedia.org/wiki/Zephyr_(operating_system)) is still considered firmware, as these OSs provide very minimal abstraction and you're still programming close to the hardware.

<h1 id="tools-of-the-trade">3. Tools of the trade</h1>

If you work in embedded systems, you cannot be scared of electronics. You'll be working directly with circuits, components, and electrical signals on a daily basis. Understanding how to safely handle, test, and debug electronic systems is fundamental to the job.

Having the right tools and knowing how to use them is just as important as knowing how to write code. While software engineers have their IDEs and debuggers, embedded systems engineers have their lab equipment. These tools allow you to see what's actually happening in your circuit, allowing you to diagnose hardware issues that no amount of code can reveal.

Let's go through the essential tools used on the job.

<strong>Caution:</strong>  
If you have never handled electronics before, stick to low-energy components like cell batteries and LEDs. You can burn your house down or hurt yourself pretty badly with electronics.  
The best way to get started is having someone in person showing you the basics, but don't be afraid to try on your own.

<h2 id="multimeter">3.1 Multimeter</h2>

This is the first tool you should get acquainted with and is also the most basic lab tool.
A [multimeter](https://en.wikipedia.org/wiki/Multimeter) is, for the most part, a diagnostic tool. It can take instantaneous voltage, current, resistance, inductance and capacitance readings. Beware though, you can still break things and burn your house down by misusing a multimeter!

<h2 id="soldering-iron">3.2 Soldering Iron</h2>

An embedded system is made of many different components, which need to be joined electrically.  
This is done with [solder](https://en.wikipedia.org/wiki/Solder), a metal alloy that melts between 180-300°C (depending on the lead content).
The melting temperature is low enough that soldering can be safely done at home with a simple (yet very dangerous if misused) tool called a <span tt="soldering_iron">soldering iron</span>, basically a metal rod where the pointy end is heated by passing electric current through it.

Soldering is a fundamental skill in embedded systems. You'll use it to:

- Assemble prototype circuits on <span tt="perfboard">perfboard</span> or PCBs
- Replace faulty components
- Make connections between wires and components

In industrial settings, the soldering process is automated by a <span tt="soldering_robot">soldering-iron-wielding robot</span> or by using <span tt="reflow_ovens">reflow-ovens</span>.

<h2 id="power-supply">Power Supply</h2>

Electronics need power to function. Some boards need 24 Volts, some need 5V, some need 3.3V. A bench [power supply](https://en.wikipedia.org/wiki/Power_supply) is a voltage and current source that can be set to specific values, allowing you to power your embedded system during development and testing.

Unlike wall adapters or USB power bricks, a bench power supply allows you to:

- set the exact voltage your circuit needs
- limit the maximum current to protect your circuit from damage in case of a short circuit
- monitor real-time power consumption
- quickly adjust voltage to test different operating conditions

<h2 id="oscilloscope">3.4 Oscilloscope</h2>

We have talked about how a multimeter can take instantaneous measurements of voltage, current, etc. This is very useful, but it's only useful for circuits with very simple behaviors. What if our system is more complex? In that case, to fully visualize the behavior of the system we need an  [oscilloscope](https://en.wikipedia.org/wiki/Oscilloscope) comes in, which is a tool used to graph voltage over time.

By doing that we can perform:
- [<strong>Signal integrity</strong>](https://en.wikipedia.org/wiki/Signal_integrity) analysis: Check for noise, ringing, overshoot, or distortion on your signals
- <strong>Frequency measurement</strong>: See the actual frequency and duty cycle of clock signals or [PWM](https://en.wikipedia.org/wiki/Pulse-width_modulation) outputs

For example, a multimeter might show you that a signal is at 3.3V, but an oscilloscope will show you if that signal is actually switching between 0V and 3.3V at 1MHz, or if there's 500mV of noise on top of it.

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
