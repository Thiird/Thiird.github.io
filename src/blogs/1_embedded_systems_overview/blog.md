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
            <li><a href="#output-elements">2.1.2 Output Components</a></li>
            <li><a href="#computational-unit">2.1.3 Computational Units</a></li>
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
        <li><a href="#soldering-tools">3.2 Soldering Tools</a></li>
        <li><a href="#power-supply">3.3 Power Supply</a></li>
        <li><a href="#oscilloscope">3.4 Oscilloscope</a></li>
        <li><a href="#logic-analyzer">3.5 Logic Analyzer</a></li>
        <li><a href="#the-debugger">3.6 Debugger</a></li>
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
- <span tt="soviet_seeker">the brain of a missile</span>

<h2 id="why-embedded">1.1 Why <em>'embedded'</em>?</h2>
Embedded Systems is basically applied electronics. Such electronics can't be handed to the customer as it is, it first needs to be integrated, e.g. embedded, <span tt="embedded">in some kind of enclosure</span>, hence the term embedded system.

<h1 id="how-is-it-made">2. How is it made</h1>
An embedded system is made of three main elements:

- <strong>Hardware</strong>: The electronics and the mechanical components 
- <strong>Firmware</strong>: Low-level code running directly on the hardware, controlling its basic functionalities 
- <strong>Software</strong>: Higher-level code that runs on or communicates with the <span tt="ES">ES</span> to implement higher-level functionalities

The hardware provides the physical platform, the firmware controls it directly, and the software (when present) adds higher-level functionality.

<h2 id="hardware">2.1 Hardware</h2>

The core of an <span tt="ES">ES</span> is the electronic hardware.

The electronics is consolidated in an assembly called Printed Circuit Board Assembly (PCBA), which consists of a number of components that have been electrically joined to a base board. This base board is called <span tt="PCB_image">Printed Circuit Board</span> (PCB) and it's made of alternating layers of insulating material and copper, where the copper layers have been precisely <span tt="PCB_manufacturing">manufactured</span> to leave behind only individual traces. Traces are used to route signals from one component to the other. PCBs can have one layer, <span tt="multilayer_PCB">two layers, four layers, etc</span>. Traces on different layers are connected together with <span tt="vias">vias</span>, and the ones on the external layers are what connects the electronic components together to the PCB itself by [soldering](#soldering-tools) them on specific spots on the traces.

Modern electronics needs to be as small as possible in order to fit inside our pockets. This need for smaller and smaller electronics has made components significantly decrease in size over the past decades. Nowadays, some components are in the <span tt="smd_scale">millimeter or even sub-millimeter scale</span>.

In the beginning, electronic components were connected to the PCB through metal leads, which are inserted from one side of the pcb and soldered from the other.

<span tt="THT_diagram">This kind of mounting is called Through Hole Technology (THT)</span>.

As components became smaller, leads were discarded in favour of integrated contact points. This new kind of packaging doesn't require holes in the PCB, so components get soldered directly on the traces of the two external layers of the PCB.

<span tt="SMD_diagram">This kind of mounting is called Surface Mounted Device (SMD)</span>.

Modern, high-end electronics, uses SMD components for the most part, but THT still finds its way in many applications. This is because of physics constraints: millimeter-size SMD components do exist, but they don't have the same electrical characteristics of the bigger, THT version.

Some SMD components, like USB connectors, feature both SMD-style and THT-style connections, where the latter is used to ensure mechanical stability.

Building electronics without <span tt="PCB">PCB</span>s would require a mess of wires connecting components, which would make it impossible to automate the production process, let alone create complex electronics.

Functionally speaking, the components on a <span tt="PCB">PCB</span> fall into one of four categories:

- <strong>input components</strong>
- <strong>output components</strong>
- <strong>computational units</strong>
- <strong>support components</strong>

Let's analyze these four categories while using a desktop mouse as a practical example.

<h3 id="input-elements">2.1.1 Input Components</h3>

Think of a button, dial, touch screen, receiving antenna, magnetic sensor, light sensor, humidity sensor: anything that can produce electrical signals that describe the surrounding environment.

All of these devices are connected, either directly or [through intermediate circuitry](#support-components), to the computational unit.

In the case of the desktop mouse, the input components are the buttons, scroll wheel and motion sensor. These components capture the intention of the users and pass them to the computational unit as electrical signals.

<h3 id="output-elements">2.1.2 Output Components</h3>

Output components are how the <span tt="ES">ES</span> talks back to you or to other systems.

Think of LEDs, displays (LCD, OLED, seven-segment, e-paper), buzzers, speakers, motors (DC, stepper, servo), relays, heating elements, and RF protocols like Bluetooth.

All of these components are controlled, either directly or [through intermediate circuitry](#support-components), by the <span tt="CU">CU</span>.

In the case of a desktop mouse, the output of the system is the USB or Bluetooth packets that encode the buttons state and motion data.

<h3 id="computational-unit">2.1.3 Computational Units</h3>

This is the core of the system, this is where the actual computation is performed.

Computational Units, <span tt="CU">CU</span>s from now on, are <span tt="IC">integrated circuits</span> (ICs) that implement some kind of computer.

Most embedded systems have only one <span tt="CU">CU</span>, but it's common for more advanced systems to have more than one, either on the same or separate <span tt="PCB">PCB</span>s.

Architecture wise, there are three main kinds computational units. Let's analyze all of them starting from the one found in desktop PCs: the <span tt="CPU">CPU</span>.

<div class="highlight-box">
The <strong>Central Processing Unit</strong> (<span tt="CPU">CPU</span>) is an integrated circuit that implements a computer capable of performing a fixed number of operations. These operations are called <strong>machine instructions</strong>. Once turned on, the <span tt="CPU">CPU</span> starts executing the machine instructions specified in a program, which is a finite list of machine instructions. The set of all valid machine instructions that a program can use, is defined in the <strong>Instruction Set Architecture</strong> (<span tt="isa">ISA</span>) of the <span tt="CPU">CPU</span>. Changing the program changes what the <span tt="CPU">CPU</span> does, which <span tt="cpu_non_triviality">makes the CPU a general-purpose computer</span>.
</div>

In embedded systems, <span tt="cpu_types">many different types of CPUs</span> are used as the computational unit. The difference in name tries to capture the difference in clock speed, core count, presence of integrated RAM and capabilities.

The flexibility that <span tt="CPU">CPU</span>s have, comes at the cost of speed. Following a list of instructions takes time, as the <span tt="CPU">CPU</span> needs to read the next instruction, activate the part of the chip that does that, and then actually execute it. This is called the [<em>Fetch-Decode-Execute</em>](https://en.wikipedia.org/wiki/Instruction_cycle) cycle.

The F-D-E cycle is less than ideal for applications where the computation to be performed is 'already known', and maximum speed is required. Think of high-performance applications like <span tt="dsp_example">digital signal processing</span>. What we need in those cases, is to trade all the flexibility for all the speed.

We can achieve this with an <strong>ASIC</strong>.

<div class="highlight-box">
The <strong>Application Specific Integrated Circuit</strong> (ASIC), is an integrated circuit that implements a fixed-purpose computer. When turned on, it will always execute the same computation, as it's not configurable in anyway.
</div>

<span tt="ASIC">ASIC</span>s come with significant trade-offs: high development cost and inflexibility. Developing an <span tt="IC">IC</span> is very expensive (regardless of what it does), and making one for a specific use case, makes it even more expensive, as the narrow markets will result in fewer units sold. Moreover, once manufactured, <span tt="IC">IC</span>s cannot be changed: if there's a design error you are stuck with it. This is true for all <span tt="IC">IC</span>s, but it's particularly painful for <span tt="ASIC">ASIC</span>s as they are, unlike <span tt="CPU">CPU</span>s, not configurable in any way. This makes <span tt="ASIC">ASIC</span>s economically viable only for markets where, for example, performance comes before cost, like military applications.

Talking about <span tt="CPU">CPU</span>s and <span tt="ASIC">ASIC</span>s, we have gone from extreme flexibility and low speed, to zero flexibility and high-speed.  
What if we wanted the performance of <span tt="ASIC">ASIC</span>s with some computational flexibility? That's what <span tt="FPGA">FPGA</span>s are for.

<div class="highlight-box">
A <strong>Field-Programmable Gate Array</strong> (FPGA) is an integrated circuit containing an array of <a href="https://en.wikipedia.org/wiki/Logic_block" target="_blank">configurable logic blocks</a> (CLBs). Each block can be configured in both the <span tt="logic_block_details">logical function</span> it performs and how it connects with the other blocks. At startup, the FPGA loads a <a href="#fpga-software">bitstream</a> that precisely defines the function of each block and its routing, enabling virtually any digital circuit to be realized directly in hardware.
</div>

In the case of the desktop mouse, the computational unit is an MCU programmed to read the signals from the the buttons, scroll wheel and motion sensor, package them into, for example, USB or Bluetooth data packets, and send those off to the connected PC.

<span tt="softcore">Any digital circuit can be implemented on an FPGA</span>, from a simple binary counter to a complex Fourier transform.

In terms of performance, <span tt="FPGA">FPGA</span>s sit between <span tt="CPU">CPU</span>s and <span tt="ASIC">ASIC</span>s but much closer to <span tt="ASIC">ASIC</span>s. With an <span tt="FPGA">FPGA</span>, algorithms run directly in  hardware, providing massive speedups over <span tt="CPU">CPU</span> execution. However, due to the overhead of the configurable circuitry, <span tt="FPGA">FPGA</span>s are typically less efficient in speed and power than <span tt="ASIC">ASIC</span>s.

Modern <span tt="FPGA">FPGA</span> chips integrate far more than just the CLBs matrix, like dedicated RAM blocks, and high-speed I/O transceivers.

It is also common to integrate a <span tt="CPU">CPU</span> and an <span tt="FPGA">FPGA</span> on the same die, so that, for example, the <span tt="CPU">CPU</span> can run an OS like Linux while offloading compute-intensive operations, like image processing or cryptography, to the <span tt="FPGA">FPGA</span> for acceleration.

Both <span tt="CPU">CPU</span>s and <span tt="FPGA">FPGA</span>s are general-purpose computational devices, but the key difference lies in how they can be reprogrammed: <span tt="CPU">CPU</span>s dynamically select the next instruction at runtime, while <span tt="FPGA">FPGA</span>s are reconfigured at startup via a new bitstream.

When discussing <span tt="CPU">CPU</span>s, we use terms like "software" and "programming", which are also used with <span tt="FPGA">FPGA</span>s, but they mean very different things:

<ul>
  <li id="cpu-software"><strong>CPU software:</strong> The software of <span tt="CPU">CPU</span>s is the list of machine instructions that the <span tt="CPU">CPU</span> executes. This list is what makes up the program the CPU executes, and it's either written directly in machine code or obtained through <strong>compilation</strong>, a process that translates higher-level code written by a programmer in a programming language like C or C++ to the equivalent machine code of the target CPU.
  <li id="fpga-software"><strong>FPGA software:</strong> The software of <span tt="FPGA">FPGA</span>s is code written in an <a href="https://en.wikipedia.org/wiki/Hardware_description_language" target="_blank">Hardware Description Language</a> (HDL), like Verilog or VHDL, that gets <strong>synthesized</strong> to a bitstream and then used to configure the CLBs in the <span tt="FPGA">FPGA</span> to implement a certain function. The resulting bitstream depends on the input HDL code, <span tt="target_fpga_model">the target  model</span>, and <span tt="synthesis_toolchain">the synthesis toolchain used</span>.</li>
</ul>

<h3 id="support-components">2.1.4 Support Components</h3>

Support components don't directly participate in sensing, computing, or actuating, but provide the necessary electrical environment for the system to [power on](#voltage-regulators), [function properly](#passive-components) and [maintain reliability](#protection-circuits) across all intended operating conditions.

These include:

- <strong id="voltage-regulators">Voltage regulators:</strong> they convert the input voltage of the system to the specific voltages required by different parts of the circuit.
- <strong id="passive-components">Passive components:</strong> <span tt="resistors">resistors</span>, <span tt="capacitors">capacitors</span>, and <span tt="inductors">inductors</span> that filter noise and set timing constants.
- <strong id="protection-circuits">Protection circuits:</strong> <span tt="ESD_protection">ESD protection</span>, <span tt="reverse_polarity_protection">reverse polarity protection</span>, <span tt="overcurrent_protection">overcurrent protection</span>.  

<h2 id="firmware">2.2 Firmware</h2>

Firmware is the low-level code that runs on the CU and directly controls the hardware: it configures registers, handles interrupts, manages timers, and interfaces with peripherals.

It's called <em>firm</em> and not <em>soft</em>(ware) because <span tt="firmware_unchanged">it's typically written once and remains mostly unchanged for the lifetime of the product</span>.

Firmware programming is mostly characterized by the absence of an operating system. The absence of an abstraction layer between the code and its effect is called <em>bare metal</em> programming, <span tt="bare_metal_example">as single lines of code result in measurable changes in reality</span>.  
This is not always the case. Modern embedded systems can be quite complicated, both in the <span tt="hardware_capabilities">hardware capabilities</span> and the <span tt="system_logic">logic of the system</span>, so a minimal operating system can be used to aid the programmer in managing the system. These operative systems provide minimal abstraction over the hardware, allowing the programmer to make full and efficient use of the capabilities of the system by using constructs like threads and work queues.

Some examples of such minimal, so called <em>embedded operative systems</em>, are <a href="https://www.freertos.org/" target="_blank">FreeRTOS</a> and <a href="https://www.zephyrproject.org/" target="_blank">Zephyr</a>.

<h2 id="software">2.3 Software</h2>

In the embedded world, we use the term <em>software</em> to refer to both the high-level code running <em>on-device</em>, on top of a <span tt="full_os_requirements">canonical operative system like Linux or Android</span>, and the code running <em>off-device</em> that interacts with the embedded device nonetheless.

In particular, we refer to the former as <strong><em>embedded software</em></strong> and the latter as just <strong><em>software</em></strong>.

<strong><em>Embedded software</em></strong> is about <em>on-device</em>, user-space application development and the system programming required to support those.

<strong><em>Software</em></strong> is about <em>off-device</em> code that adds extra functionality to the device, and it's often about making it easier to interact with the <span tt="ES">ES</span>.

Software uses operating system APIs and libraries to provide high-level functionalities. Being applications running on top of an OS, software is much easier to update, as a simple change of the executable file is often the only needed thing.

<span tt="bench_power_supply_example">Complex embedded products use both</span>: firmware handles low level hardware functionalities (like reading sensors or controlling motors), while software handles the user-level applications, like graphical interfaces and networking.

Note that code running embedded operating systems like [FreeRTOS](https://en.wikipedia.org/wiki/FreeRTOS) and [Zephyr](https://en.wikipedia.org/wiki/Zephyr_(operating_system)) is still considered firmware, as those OSs provide very minimal abstraction and the code is still directly programming the hardware.

<h1 id="tools-of-the-trade">3. Tools of the trade</h1>

If you work in embedded systems, you must love electronics.  
You'll be working directly with circuits, components, and electrical signals on a daily basis.  Understanding how to safely handle, test, and debug electronic systems is fundamental to the job.

Having the right tools and knowing how to use them is just as important as knowing how to write code. While software engineers have their IDEs and debuggers, embedded systems engineers have their lab equipment. These tools allow you to diagnose hardware issues that no amount of print statements can reveal.

Let's go through the essential tools that you will need.

<div class="highlight-box">
<strong>Caution:</strong>  
If you have never handled electronics before, stick to low-energy components like cell batteries and LEDs. You can burn your house down or hurt yourself pretty badly with electronics.  
The best way to get started is having someone showing you the basics in persons. Nevertheless, don't be afraid to try on your own.
</div>

<h2 id="multimeter">3.1 Multimeter</h2>

This is the first tool you should get acquainted with and is also the most basic lab tool.  
A multimeter is, for the most part, a diagnostic tool. It takes instantaneous voltage, current, resistance, inductance and capacitance readings and displays it to the user. Multimeters can both be analog and digital. <span tt="amm">Analog multimeters</span> take a continuous reading and display it with a needle meter, whereas <span tt="dmm">digital multimeters</span> take discrete readings with a frequency of a few Hertz and display the reading on a digital screen.

A multimeter is used to characterize simple signals, as it only answers to wether it is there and how much it measures in that instant, while saying nothing about its behavior.

<h2 id="oscilloscope">3.2 Oscilloscope</h2>

When dealing with complex signals, we want to know more than just whether the signal is present or not. To understand a signal's behavior, we need to record many different samples of it and display them over time. To do this, we need a high-frequency sampling rate and a way to <span tt="oscilloscope_data_rate">display such an immense amount of data</span> in a way that is <span tt="oscilloscope_signal_visualization">easy for the human brain to understand</span>.

The tool for the job is the <span tt="oscilloscope">oscilloscope</span>, which plots the voltage value of a signal over time.

It's used to verify [<strong>signal integrity</strong>](https://en.wikipedia.org/wiki/Signal_integrity) (<span tt="signal_integrity_issues">looking for issues like noise and ringing</span>) and measure signal characteristics (<span tt="signal_characteristics">like frequency, rise time, or timing relationships between signals</span>).

For example, what a multimeter might show as a steady 3.3V signal, an oscilloscope will reveal is actually a <span tt="waves">more complex signal</span> switching between 0V and 3.3V at 10MHz.

Oscilloscopes differ in number of <span tt="oscilloscope_channels">input channels</span>, sampling frequency and <span tt="signal_analysis_capabilities">signal analysis capabilities</span>. Modern, top-of-the-line oscilloscopes have sampling frequencies in the range of tens of GHz.

<h2 id="soldering-tools">3.3 Soldering Tools</h2>

An embedded system is made of many different components, which need to be joined electrically.  
This is done with [solder](https://en.wikipedia.org/wiki/Solder), a metal alloy that melts between 180-300°C (depending on the lead content).
The melting temperature is low enough that soldering can be safely done at home.

The quintessential soldering tool is the <span tt="soldering_iron">soldering iron</span>, basically a metal rod where the pointy end is heated by passing electric current through it. A soldering iron is <span tt="THT_soldering">mostly used with THT components</span>.

SMD components instead, are conventionally soldered with <span tt="solder_paste">solder paste</span>, a mixture of tiny solder balls and flux that gets applied to the <span tt="pcb_pads">PCB pads</span>, exactly between the unsoldered parts and the PCB. The whole PCBA is then put through the so called reflow process, basically a process where the assembly is heated up as a whole to make the solder balls melt and solder the individual parts to the PCB. This process is quite <span tt="reflow">mesmerizing</span>.

Reflow can be done with different tools:
- <strong>Reflow oven</strong>: A specialized oven that heats the entire PCB assembly following a precise temperature profile. This is the standard soldering method for high-density, SMD-based designs. 
- <strong>Hot air station</strong>: Hand-held device that directs a controlled stream of heated air to the specific area of the PCB where solder needs to melt, making it ideal for reworking individual components. This tool is what most engineers use in their lab.
- <strong>Reflow plate</strong>: A heated plate that heats the PCB from below, melting the solder paste. More affordable than a reflow oven and suitable for hobbyists and small-scale production.

Conventional soldering works best with THT components and reflowing works best for SMD components, nevertheless, a soldering iron can be used for SMD components too. Needless to say this requires <span tt="soldering_smd">skills and the right tools</span>.

In industrial settings, the soldering process is automated by a <span tt="soldering_robot">soldering-iron-wielding robot</span> or by using <span tt="reflow_oven">reflow-ovens</span>.

<h2 id="power-supply">3.4 Power Supply</h2>

Electronics need power to function. Some boards need 24 Volts, some need 5V, some need 3.3V. A <span tt="bench_power_supply">bench power supply</span> is a voltage and current source that can be set to specific values, allowing you to power your embedded system during development and testing.

Unlike wall adapters or USB power bricks, a bench power supply allows you to:

- set the exact voltage your circuit needs
- limit the maximum current to protect your circuit from damage in case of a short circuit
- monitor real-time power consumption

<h2 id="the-debugger">3.5 Debugger</h2>
In embedded systems, the <span tt="debugger">debugger</span> is a device that sits between the <span tt="ES">ES</span> and the development machine, and it's used for:

- <strong>Programming</strong>: <span tt="flash_program">Flashing</span> the compiled code onto the microcontroller's memory
- <strong>Debugging</strong>: Setting breakpoints, stepping through code, and inspecting variables while the program runs on the embedded system
- <strong>Real-time monitoring</strong>: Observing program execution and hardware state without halting the processor

Embedded systems use two debugging protocols, Serial Wire Debug (SWD) and Joint Test Action Group (JTAG).
The two serve the same code-debugging purpose, but JTAG also offers <span tt="jtag_advanced_functionalities">other advanced functionalities</span>.

<h1 id="how-to-get-started">4. How to get started</h1>

You are incredibly lucky: getting started with embedded systems has never been easier.
Knowledge is basically free thanks to the internet, writing software is free, and making hardware has never been cheaper, both mechanical and electrical.
Most low-cost prototyping services are from China, but some western alternatives are also available.

Embedded systems can be very diverse, but I think the best way to start is with a microcontroller development board. It's something that you can plug into your computer and start to program right away, with no other hardware necessary.

The real difficulty is getting the basics down. Embedded Systems is very finicky and <span tt="es_nuances">full of nuances</span>, that if accounted for will make your project NOT work. Either you do it right or it won't work, not for long at least.

Just like you can write a program that seems to work but crashes after 5 hours, you can build a circuit that seems to work but turns off after 2 hours.

The good news is that you will discover most these nuances by just studying the basics and doing very very simple projects. Try to turn on an LED. If it's your first time, chances are you will burn it. Lookup a tutorial and you will learn so much.

Again, embedded system is a vast field, it's easy to waste time thinking about where to start.  
Just start: you don't know what you are doing anyway.  
It's important to just start, don't worry about where.

<h2 id="how-to-grow-meaningful-knowledge">4.1 How to grow meaningful knowledge</h2>

What I see new people often do, is to work on one small project after another and shelving them quickly, for the sake of learning.
In my humble opinion, this is a rabbit hole that anyone should be careful about falling into. Don't get me wrong, it's ok to play with ideas, not only that, it's necessary.
But at the end of the day we need to build real products, so how about we practice that instead?  

It's preferable to have one well-done, fully finished project instead of eight half finished learning projects.
It's better for you, as you will get "the whole picture" of building embedded systems, and it's better for your career, as now you will have something to show in job interviews.

You are a beginner, any project will teach you a lot, so my suggestion is to focus your efforts to build something that you or someone else actually needs. Putting your device in someone's hand, will give you the precious user-engineer feedback that is crucial to actually learn how to make products functional. 

<h2 id="learning-resources">4.2 Learning resources</h2>

<strong>YouTube Channels & Video Content:</strong>
- [<strong>Philip Salmony</strong>](https://www.youtube.com/@PhilSalmony)'s PCB design and DSP theory videos: excellent for understanding signal processing and board design fundamentals
- [<strong>Dave Jones</strong>](https://www.youtube.com/@EEVblog)'s [<em>EEVblog</em>](https://www.eevblog.com/): comprehensive electronics theory videos covering everything from basic circuits to advanced measurement techniques
- [<strong>Shahriar Shahramian</strong>](https://www.youtube.com/@TheSignalPathBlog)'s [<em>The Signal Path</em>](https://thesignalpath.com/): metrology theory and teardowns of high-end test equipment
- [<strong>Ben Eater</strong>](https://www.youtube.com/@BenEater)'s channel: incredible step-by-step build videos showing how computers work from the ground up
- [<strong>Adam Taylor</strong>](https://www.linkedin.com/in/adam-taylor-fpga/)'s [<em>MicroZed Chronicles</em>](https://www.hackster.io/adam-taylor) blog: FPGA articles directly from an industry expert

<strong>Online Communities:</strong>
- [r/embedded](https://www.reddit.com/r/embedded/) on Reddit: active community for questions and discussions 
- [Stack Overflow embedded tags](https://stackoverflow.com/questions/tagged/embedded): good for specific programming questions
