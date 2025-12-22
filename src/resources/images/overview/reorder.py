"""
Drag & Drop Image Sorter & Renamer

How to use:
1. Place this script in the folder containing your JPG/JPEG images
2. Run it: python drag_sort_images.py
3. Drag images from the left panel and drop them onto the right panel
   → They will be added to the sequence in the order you drop them
4. Arrange by dragging and dropping in your desired order
5. When finished, close the window
   → Images will be automatically renamed to 1.jpg, 2.jpg, 3.jpg, ...

No buttons, fully drag-and-drop!
"""

import os
import tkinter as tk
from tkinter import messagebox
from pathlib import Path
from PIL import Image, ImageTk

class DragDropImageSorter:
    def __init__(self, root):
        self.root = root
        self.root.title("Drag & Drop Image Sorter")
        self.root.geometry("1200x800")
        self.root.configure(bg="#f0f0f0")

        self.available_images = []  # Paths still on left
        self.ordered_images = []    # Final order on right
        self.drag_data = {}         # For drag-and-drop state
        self.thumb_refs = []
        self.selected_left = None   # Selected image on left
        self.selected_right = None  # Selected index on right

        # Header + folder info
        tk.Label(root, text="Double-Click Images → Right to Order Them", font=("Helvetica", 18, "bold"), bg="#f0f0f0").pack(pady=15)

        current_folder = Path(__file__).parent.resolve()
        tk.Label(root, text=f"Folder: {current_folder}", font=("Helvetica", 10), bg="#f0f0f0", fg="gray").pack(pady=5)

        # Main panels
        main_frame = tk.Frame(root)
        main_frame.pack(fill="both", expand=True, padx=20, pady=10)

        # Left: Available images
        left_frame = tk.LabelFrame(main_frame, text="Available Images - Double-click to add", font=("Helvetica", 12), bg="white")
        left_frame.pack(side="left", fill="both", expand=True)

        self.left_canvas = tk.Canvas(left_frame, bg="white")
        left_scroll = tk.Scrollbar(left_frame, orient="vertical", command=self.left_canvas.yview)
        self.left_canvas.configure(yscrollcommand=left_scroll.set)
        left_scroll.pack(side="right", fill="y")
        self.left_canvas.pack(side="left", fill="both", expand=True)

        self.left_grid = tk.Frame(self.left_canvas, bg="white")
        self.left_canvas.create_window((0, 0), window=self.left_grid, anchor="nw")
        self.left_grid.bind("<Configure>", lambda e: self.left_canvas.configure(scrollregion=self.left_canvas.bbox("all")))

        # Middle: Arrow controls
        middle_frame = tk.Frame(main_frame, bg="#f0f0f0", width=100)
        middle_frame.pack(side="left", fill="y", padx=10)
        middle_frame.pack_propagate(False)
        
        tk.Label(middle_frame, text="Controls", font=("Helvetica", 10, "bold"), bg="#f0f0f0").pack(pady=20)
        
        tk.Button(middle_frame, text="→", font=("Helvetica", 16, "bold"), width=4, height=2,
                 bg="#4CAF50", fg="white", command=self.add_selected_to_right).pack(pady=10)
        
        tk.Button(middle_frame, text="←", font=("Helvetica", 16, "bold"), width=4, height=2,
                 bg="#f44336", fg="white", command=self.remove_selected_from_right).pack(pady=10)
        
        tk.Label(middle_frame, text="Reorder", font=("Helvetica", 9), bg="#f0f0f0", fg="gray").pack(pady=(30, 5))
        
        tk.Button(middle_frame, text="↑", font=("Helvetica", 14, "bold"), width=4,
                 bg="#2196F3", fg="white", command=self.move_selected_up).pack(pady=5)
        
        tk.Button(middle_frame, text="↓", font=("Helvetica", 14, "bold"), width=4,
                 bg="#2196F3", fg="white", command=self.move_selected_down).pack(pady=5)

        # Right: Ordered sequence
        right_frame = tk.LabelFrame(main_frame, text="Ordered Sequence", font=("Helvetica", 12), bg="#f8f8f8")
        right_frame.pack(side="right", fill="both", expand=True, padx=(20, 0))

        # Buttons at bottom
        btn_frame = tk.Frame(root, bg="#f0f0f0")
        btn_frame.pack(pady=10)
        
        tk.Button(btn_frame, text="Reset All", font=("Helvetica", 11), 
                 bg="#FF9800", fg="white", padx=15, pady=6, 
                 command=self.reset_all).pack(side="left", padx=5)
        
        tk.Button(btn_frame, text="Rename Images", font=("Helvetica", 12, "bold"), 
                 bg="#4CAF50", fg="white", padx=20, pady=8, 
                 command=self.rename_with_confirmation).pack(side="left", padx=5)

        self.right_canvas = tk.Canvas(right_frame, bg="#f8f8f8")
        right_scroll = tk.Scrollbar(right_frame, orient="vertical", command=self.right_canvas.yview)
        self.right_canvas.configure(yscrollcommand=right_scroll.set)
        right_scroll.pack(side="right", fill="y")
        self.right_canvas.pack(side="left", fill="both", expand=True)

        self.right_frame = tk.Frame(self.right_canvas, bg="#f8f8f8")
        self.right_canvas.create_window((0, 0), window=self.right_frame, anchor="nw")
        self.right_frame.bind("<Configure>", lambda e: self.right_canvas.configure(scrollregion=self.right_canvas.bbox("all")))

        # Auto-rename on close
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

        # Load images
        self.load_images()

    def load_images(self):
        folder = Path(__file__).parent.resolve()
        exts = {".jpg", ".jpeg", ".JPG", ".JPEG", ".gif", ".GIF"}
        all_images = [p for p in folder.iterdir() if p.is_file() and p.suffix in exts]
        
        if not all_images:
            messagebox.showinfo("No Images", "No JPG/JPEG/GIF files found in this folder.")
            self.root.destroy()
            return

        # Separate numbered images from others
        numbered = []
        others = []
        
        for p in all_images:
            stem = p.stem
            if stem.isdigit():
                numbered.append((int(stem), p))
            else:
                others.append(p)
        
        # Sort numbered images by number
        numbered.sort(key=lambda x: x[0])
        
        # Auto-load numbered images to right panel in order
        if numbered:
            self.ordered_images = [p for _, p in numbered]
        
        # Remaining images go to available
        self.available_images = sorted(others, key=lambda x: x.name.lower())
        
        self.rebuild_left_grid()
        if self.ordered_images:
            self.rebuild_right_panel()

    def rebuild_left_grid(self):
        for widget in self.left_grid.winfo_children():
            widget.destroy()

        # Clear selection since widgets are destroyed
        self.selected_left = None
        self.selected_left_label = None

        cols = 6
        size = (130, 130)

        for i, path in enumerate(self.available_images):
            try:
                img = Image.open(path)
                img.thumbnail(size, Image.Resampling.LANCZOS)
                photo = ImageTk.PhotoImage(img)
                self.thumb_refs.append(photo)

                label = tk.Label(self.left_grid, image=photo, bg="white", bd=2, relief="raised", cursor="hand2")
                label.grid(row=i // cols, column=i % cols, padx=8, pady=8)
                label.path = path  # Attach path
                label.bind("<Button-1>", lambda e, lbl=label, p=path: self.select_left(lbl, p))
                label.bind("<Double-Button-1>", lambda e, p=path: self.move_to_right(p))
            except:
                pass
    
    def select_left(self, label, path):
        # Deselect previous
        if hasattr(self, 'selected_left_label') and self.selected_left_label:
            try:
                self.selected_left_label.configure(bd=2, relief="raised")
            except:
                pass  # Widget was destroyed
        
        # Select new
        self.selected_left = path
        self.selected_left_label = label
        label.configure(bd=4, relief="solid")

    def move_to_right(self, path):
        if path in self.available_images:
            # Remove from left
            self.available_images.remove(path)
            self.rebuild_left_grid()

            # Add to right
            self.ordered_images.append(path)
            self.rebuild_right_panel()
    
    def add_selected_to_right(self):
        if self.selected_left and self.selected_left in self.available_images:
            self.move_to_right(self.selected_left)
            self.selected_left = None
    
    def remove_selected_from_right(self):
        if self.selected_right is not None and 0 <= self.selected_right < len(self.ordered_images):
            removed = self.ordered_images.pop(self.selected_right)
            self.available_images.append(removed)
            self.available_images.sort(key=lambda x: x.name.lower())
            self.selected_right = None
            self.rebuild_left_grid()
            self.rebuild_right_panel()
    
    def move_selected_up(self):
        if self.selected_right is not None and self.selected_right > 0:
            idx = self.selected_right
            self.ordered_images[idx], self.ordered_images[idx-1] = self.ordered_images[idx-1], self.ordered_images[idx]
            self.selected_right = idx - 1
            self.rebuild_right_panel()
    
    def move_selected_down(self):
        if self.selected_right is not None and self.selected_right < len(self.ordered_images) - 1:
            idx = self.selected_right
            self.ordered_images[idx], self.ordered_images[idx+1] = self.ordered_images[idx+1], self.ordered_images[idx]
            self.selected_right = idx + 1
            self.rebuild_right_panel()
    
    def reset_all(self):
        # Move all ordered images back to available
        self.available_images.extend(self.ordered_images)
        self.available_images.sort(key=lambda x: x.name.lower())
        self.ordered_images.clear()
        self.selected_left = None
        self.selected_right = None
        
        self.rebuild_left_grid()
        self.rebuild_right_panel()

    def rebuild_right_panel(self):
        for widget in self.right_frame.winfo_children():
            widget.destroy()

        size = (130, 130)

        for i, path in enumerate(self.ordered_images):
            try:
                img = Image.open(path)
                img.thumbnail(size, Image.Resampling.LANCZOS)
                photo = ImageTk.PhotoImage(img)
                self.thumb_refs.append(photo)

                frame = tk.Frame(self.right_frame, bg="#f8f8f8", cursor="hand2")
                frame.pack(fill="x", pady=4, padx=10)
                frame.bind("<Button-1>", lambda e, idx=i: self.select_right(idx))

                num = tk.Label(frame, text=f"{i+1}.", font=("Helvetica", 12, "bold"), bg="#f8f8f8", width=4, cursor="hand2")
                num.pack(side="left")
                num.bind("<Button-1>", lambda e, idx=i: self.select_right(idx))

                label = tk.Label(frame, image=photo, bg="white", bd=2, relief="sunken", cursor="hand2")
                label.image = photo
                label.pack(side="left", padx=8)
                label.bind("<Button-1>", lambda e, idx=i: self.select_right(idx))
                
                # Store frame reference for selection highlighting
                frame.idx = i
            except:
                pass
    
    def select_right(self, idx):
        # Deselect all frames
        for widget in self.right_frame.winfo_children():
            widget.configure(bg="#f8f8f8")
            for child in widget.winfo_children():
                if isinstance(child, tk.Label):
                    if child.cget("text").endswith("."):
                        child.configure(bg="#f8f8f8")
        
        # Select clicked frame
        self.selected_right = idx
        clicked_frame = list(self.right_frame.winfo_children())[idx]
        clicked_frame.configure(bg="#bbdefb")
        for child in clicked_frame.winfo_children():
            if isinstance(child, tk.Label) and child.cget("text").endswith("."):
                child.configure(bg="#bbdefb")

    def on_closing(self):
        self.root.destroy()

    def rename_with_confirmation(self):
        if not self.ordered_images:
            messagebox.showinfo("No Images", "Please select images first by clicking them on the left.")
            return
            
        result = messagebox.askyesno("Rename Images?",
                                    f"Rename {len(self.ordered_images)} images to 1.jpg – {len(self.ordered_images)}.jpg?")
        if result:
            self.rename_images()
            messagebox.showinfo("Done!", f"Successfully renamed {len(self.ordered_images)} images!")
            self.root.destroy()

    def rename_images(self):
        folder = Path(__file__).parent
        temp_paths = []

        try:
            # Rename to temp names
            for i, path in enumerate(self.ordered_images):
                temp = folder / f"__temp_sort_{i:05d}.jpg"
                path.rename(temp)
                temp_paths.append(temp)

            # Rename to final
            for i, temp in enumerate(temp_paths, 1):
                final = folder / f"{i}.jpg"
                if final.exists():
                    final.unlink()
                temp.rename(final)

        except Exception as e:
            messagebox.showerror("Error", f"Renaming failed:\n{e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = DragDropImageSorter(root)
    root.mainloop()